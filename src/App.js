import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const backgroundSize = ["contain", "cover", "auto", "10%", "20%"];
const backgroundRepeat = ["repeat-x", "repeat", "space", "round", "no-repeat"];
const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((data) => {
        setImages(data);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoading) console.log(images[Math.floor(Math.random() * 5000)].url);
  }, [images]);

  const deleteMoveable = () => {
    const itemIndex = moveableComponents.findIndex(
      (item) => item.id === selected
    );

    const items = [...moveableComponents];
    if (items.length > 0) {
      setMoveableComponents(items.filter((item, index) => index !== itemIndex));
    }
    console.log(items);
    console.log(selected);
    console.log(itemIndex);
  };

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        imageUrl: images[Math.floor(Math.random() * 5000)].url,
        backgroundSize: backgroundSize[Math.floor(Math.random() * 5)],
        backgroundRepeat: backgroundRepeat[Math.floor(Math.random() * 5)],
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <button onClick={deleteMoveable}>Delete Moveable</button>
      <div
        id="parent"
        className="snapContainer"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  imageUrl,
  backgroundSize,
  backgroundRepeat,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
    imageUrl,
    backgroundSize,
    backgroundRepeat,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      imageUrl,
      backgroundSize,
      backgroundRepeat,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;
    console.log(`translate(${translateX}px, ${translateY}px)`);
    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      // top: top + translateY < 0 ? 0 : top + translateY,
      // left: left + translateX < 0 ? 0 : left + translateX,
      top: "0px",
      left: "0px",
    });
  };

  const onResizeEnd = async (e) => {
    console.log("xxx");
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        imageUrl,
        backgroundSize,
        backgroundRepeat,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="target"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: backgroundSize,
          backgroundRepeat: backgroundRepeat,
          backgroundPosition: "center",
        }}
        onClick={() => setSelected(id)}
      ></div>

      <Moveable
        throttleDrag={1}
        edgeDraggable={false}
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            imageUrl,
            backgroundSize,
            backgroundRepeat,
          });
        }}
        onResize={(e) => {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
          e.target.style.transform = e.drag.transform;
        }}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        snappable={true}
        snapDirections={{ top: true, left: true, bottom: true, right: true }}
        snapThreshold={5}
        verticalGuidelines={[50, 150, 250, 450, 550]}
        horizontalGuidelines={[0, 100, 200, 400, 500]}
        snapContainer={".snapContainer"}
        bounds={{ left: 0, top: 0, right: 0, bottom: 0, position: "css" }}
      />
    </>
  );
};
