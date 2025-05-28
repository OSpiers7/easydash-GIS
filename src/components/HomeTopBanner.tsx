import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

import { useSelector } from "react-redux";
import { selectIsUserLoggedIn } from "../redux/reducers";

import UploadGeo from "./GeoJsonUpload";
import WMSupload from "./WMSupload";

interface HomeTopBannerProps {

  loginUser: () => void;
}

const HomeTopBanner: React.FC<HomeTopBannerProps> = ({ loginUser}) => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const isLoggedIn = useSelector(selectIsUserLoggedIn);

  return (
    <ul
      onMouseLeave={() => {
        setPosition((pv) => ({
          ...pv,
          opacity: 0,
        }));
      }}
      className="relative mx-auto flex w-fit rounded-full border-2 border-black bg-[#F0B5A3] p-1"
    >
      <Tab setPosition={setPosition}>
        Home
      </Tab>

      {/*CHANGE THE ONCLICK TO OPEN LOG IN MENU*/}
      <Tab setPosition={setPosition} onClick={loginUser}>
        Log In
      </Tab>

      <Cursor position={position} />
    </ul>
  );
};
interface TabProps {
  children: React.ReactNode;
  setPosition: React.Dispatch<
    React.SetStateAction<{ left: number; width: number; opacity: number }>
  >;
  onClick?: () => void;
}

const Tab: React.FC<TabProps> = ({ children, setPosition, onClick }) => {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onClick={onClick ? onClick : undefined}
      onMouseEnter={() => {
        if (!ref?.current) return;

        const { width } = ref.current.getBoundingClientRect();

        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-black font-semibold md:px-5 md:py-3 md:text-base"
    >
      {children}
    </li>
  );
};
interface CursorProps {
  position: {
    left: number;
    width: number;
    opacity: number;
  };
}
const Cursor: React.FC<CursorProps> = ({ position }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      className="absolute z-0 h-7 rounded-full bg-[#D8CAB8] md:h-12"
    />
  );
};

export default HomeTopBanner;
