// components/MoodShape.js
import React from "react";

const MoodShape = ({ mood, size }) => {
  const sizeClass = size === "small" ? "w-6 h-6" : "w-10 h-10";

  switch (mood.shape) {
    case "square":
      return (
        <div
          className={`${mood.color} ${sizeClass} flex items-center justify-center transition-transform hover:scale-110`}
          title={mood.name}
        />
      );
    case "triangle":
      return (
        <div
          className={`${sizeClass} relative flex items-center justify-center transition-transform hover:scale-110`}
          title={mood.name}
        >
          <div
            className={`${mood.color} w-full h-full`}
            style={{
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            }}
          />
        </div>
      );
    case "diamond":
      return (
        <div
          className={`${sizeClass} relative flex items-center justify-center transition-transform hover:scale-110`}
          title={mood.name}
        >
          <div
            className={`${mood.color} w-full h-full`}
            style={{
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            }}
          />
        </div>
      );
    case "hexagon":
      return (
        <div
          className={`${sizeClass} relative flex items-center justify-center transition-transform hover:scale-110`}
          title={mood.name}
        >
          <div
            className={`${mood.color} w-full h-full`}
            style={{
              clipPath:
                "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
            }}
          />
        </div>
      );
    case "tear":
      return (
        <div
          className={`${sizeClass} relative flex items-center justify-center transition-transform hover:scale-110`}
          title={mood.name}
        >
          <div
            className={`${mood.color} w-full h-full`}
            style={{
              clipPath: "polygon(50% 0%, 80% 50%, 50% 100%, 20% 50%)",
              transform: "rotate(180deg)",
            }}
          />
        </div>
      );
    case "cloud":
      return (
        <div
          className={`${sizeClass} relative flex items-center justify-center transition-transform hover:scale-110`}
          title={mood.name}
        >
          <div
            className={`${mood.color} w-full h-full rounded-full`}
            style={{
              clipPath: "ellipse(50% 50% at 50% 50%)",
              borderRadius: "40% 40% 60% 60% / 60% 30% 70% 40%",
            }}
          />
        </div>
      );
    case "circle":
    default:
      return (
        <div
          className={`${mood.color} ${sizeClass} rounded-full flex items-center justify-center transition-transform hover:scale-110`}
          title={mood.name}
        />
      );
  }
};

export default MoodShape;
