import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
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

const INITIAL_STATE = generateShapes();

export const App = () => {
  const [timelineRect, setStars] = React.useState(INITIAL_STATE);

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    setStars(
      timelineRect.map((star) => {
        return {
          ...star,
          isDragging: star.id === id,
        };
      })
    );
  };
  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    setStars(
      timelineRect.map((star) => {
        return {
          ...star,
          isDragging: false,
        };
      })
    );
  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="Try to drag a timeline rect" />
        {timelineRect.map((el) => (
          <Rect
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
