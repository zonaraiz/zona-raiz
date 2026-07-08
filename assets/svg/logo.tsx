import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = Omit<ImageProps, "src" | "alt">;

const Logo = ({ className, ...props }: LogoProps) => {
  return (
    <Image
      src="/images/logo-icon.png"
      alt="Zonaraíz"
      width={320}
      height={252}
      className={cn("object-contain", className)}
      {...props}
    />
  );
};

export default Logo;
