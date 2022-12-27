import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import Konva from 'konva';
import { Stage, Layer, Rect, Text, Transformer, KonvaNodeEvents } from 'react-konva';
import './App.css';

const QUANTITY = 100

const generateShapes = () => {
  return [...Array(QUANTITY)].map((_, i) => ({
    id: i.toString(),
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    rotation: Math.random() * 180,
    isDragging: false,
  }));
}

export interface IRectangleProps extends Konva.RectConfig {
    isSelected: boolean;
    onSelect: KonvaNodeEvents['onClick'];
    onChange: (props: { id: string, x: number, y: number, isDragging: boolean, rotation: number }) => void;
}

const Rectangle = (props: IRectangleProps) => {
  const { isSelected, onSelect, onChange, rectProps } = props;
  const shapeRef = React.useRef<Konva.Rect>();
  const trRef = React.useRef<Konva.Transformer>();

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef as React.LegacyRef<Konva.Rect> | undefined}
        {...rectProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...rectProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          if(!node) {
              return;
          }

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...rectProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef as React.LegacyRef<Konva.Transformer> | undefined}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const INITIAL_STATE = generateShapes();

export const App = () => {
  const [rectangleElements, setRectangleElements] = React.useState(INITIAL_STATE);

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    setRectangleElements(
      rectangleElements.map((star) => {
        return {
          ...star,
          isDragging: star.id === id,
        };
      })
    );
  };
  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    setRectangleElements(
      rectangleElements.map((star) => {
        return {
          ...star,
          isDragging: false,
        };
      })
    );
  };
  const [selectedId, selectShape] = React.useState<string | null>(null);

  const checkDeselect = (e: KonvaEventObject<MouseEvent>) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  return (
    <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={checkDeselect}
        /* onTouchStart={checkDeselect} */
      >
      <Layer>
        <Text text="Try to drag a timeline rect" />
        {rectangleElements.map((el, i) => (
          <Rect
            isSelected={el.id === selectedId}
            onSelect={() => {
              selectShape(el.id);
            }}
            /* onChange={(newAttrs) => { */
            /*   const rects = rectangleElements.slice(); */
            /*   rects[i] = newAttrs; */
            /*   setRectangleElements(rects); */
            /* }} */
            opacity={0.8}
            key={el.id}
            x={el.x}
            y={el.y}
            width={50}
            height={100}
            draggable
            rotation={el.rotation}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            fillLinearGradientStartPoint={{
              x: 50,
              y: 100
            }}
            fillLinearGradientColorStops={[0, 'red', 0.5, 'blue', 1, 'green']}
          />
        ))}
      </Layer>
    </Stage>
  );
};
