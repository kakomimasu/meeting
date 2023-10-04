// https://tabler-icons.io/

import { ComponentProps } from "preact";

const paths = {
  mic: {
    on: "/img/microphone.svg",
    off: "/img/microphone-off.svg",
  },
  camera: {
    on: "/img/camera.svg",
    off: "/img/camera-off.svg",
  },
  screen: {
    on: "/img/screen-share.svg",
    off: "/img/screen-share-off.svg",
  },
  phone: {
    on: "/img/phone.svg",
    off: "/img/phone-off.svg",
  },
};

type IconType = keyof typeof paths;

type SvgIconProps = Omit<ComponentProps<"div">, "on" | "icon" | "width"> & {
  width?: number;
  icon: IconType;
  on?: boolean;
};
export default function SvgIcon({
  width,
  icon,
  on,
  style,
  ...other
}: SvgIconProps) {
  width = width ?? 24;
  return (
    <div
      style={Object.assign(
        {
          backgroundColor: on ? "green" : "transparent",
          padding: "5px",
          borderRadius: "50%",
          width: width,
          height: width,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        style
      )}
      {...other}
    >
      <img
        style={{
          filter:
            "invert(99%) sepia(5%) saturate(159%) hue-rotate(174deg) brightness(118%) contrast(100%)",
        }}
        src={on ? paths[icon].on : paths[icon].off}
        width={width ?? 24}
      />
    </div>
  );
}
