
//import Navbar from '../navigation';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  BOX: 'box',
};

const Box = ({ id, left, top, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BOX,
    item: { id, left, top },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`absolute bg-gray-400 p-4 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{ left, top }}
    >
      {children}
    </div>
  );
};

const MasonryLayout = () => {
  const [boxes, setBoxes] = useState([
    { id: 1, left: 20, top: 20 },
    { id: 2, left: 120, top: 20 },
    { id: 3, left: 220, top: 20 },
    // Add more boxes as needed
  ]);

  const moveBox = (id, left, top) => {
    setBoxes((prevBoxes) =>
      prevBoxes.map((box) => (box.id === id ? { ...box, left, top } : box))
    );
  };

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.BOX,
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      const left = Math.round(item.left + delta.x);
      const top = Math.round(item.top + delta.y);
      moveBox(item.id, left, top);
    },
  }));

  return (
    <div ref={drop} className="relative w-full h-screen">
      {boxes.map((box) => (
        <Box key={box.id} id={box.id} left={box.left} top={box.top}>
          Box {box.id}
        </Box>
      ))}
    </div>
  );
};

export default MasonryLayout;