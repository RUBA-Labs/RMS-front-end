import Image from "next/image";
import React from "react";

// The image is imported locally. Next.js automatically handles
// the optimization and serves the image from a unique URL.
import myImage from "../../../assets/1234-01.png";

export default function ImageArea() {
  return (
    <div className="relative hidden lg:block">
      {/* The Next.js Image component with the 'fill' prop is used here.
        - 'fill' makes the image fill the parent container.
        - The parent container must have 'position: relative' (handled by the 'relative' class).
        - 'object-cover' ensures the image covers the entire space without distortion.
        - The 'alt' prop is required for accessibility.
      */}
      <Image
        src={myImage}
        alt="A vibrant visual representation"
        fill
        className="object-cover dark:brightness-[0.8]"
      />
    </div>
  );
}
