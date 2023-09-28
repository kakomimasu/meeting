import { ComponentProps } from "preact";

const paths = {
  mic: {
    on: "/img/microphone.svg",
    off: "/img/microphone-off.svg",
  },
  camera: {
    on: "/img/device-computer-camera.svg",
    off: "/img/device-computer-camera-off.svg",
  },
};

type IconType = keyof typeof paths;

type SvgIconProps = Omit<ComponentProps<"img">, "src" | "icon"> & {
  icon: IconType;
  on?: boolean;
};
export default function SvgIcon({ icon, on, ...other }: SvgIconProps) {
  return (
    <img
      style={{
        filter:
          "invert(99%) sepia(5%) saturate(159%) hue-rotate(174deg) brightness(118%) contrast(100%)",
      }}
      src={on ? paths[icon].on : paths[icon].off}
      width={24}
      {...other}
    />
  );
}
