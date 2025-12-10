import Image from "next/image";
import React from "react";
import Marquee from "react-fast-marquee";
function Maintainance() {
  return (
    <div className="w-full h-full relative">
      <Marquee className="text-2xl font-bold text-center py-4 bg-kappes ">
        <span className="text-white mx-4">Content Coming Soon</span>
        <span className="text-white mx-4">Content Coming Soon</span>
        <span className="text-white mx-4">Content Coming Soon</span>
        <span className="text-white mx-4">Content Coming Soon</span>
        <span className="text-white mx-4">Content Coming Soon</span>
        <span className="text-white mx-4">Content Coming Soon</span>
        <span className="text-white mx-4">Content Coming Soon</span>
      </Marquee>
      <Image
        src="/maintainance.png"
        alt="maintainance"
        width={5000}
        height={5000}
        priority
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 flex justify-center items-center">
        <span className="text-white text-7xl font-bold animate-pulse">
          Content Coming Soon
        </span>
      </div>
    </div>
  );
}

export default Maintainance;
