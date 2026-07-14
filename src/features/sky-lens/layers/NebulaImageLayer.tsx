import React from "react";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import type {
  CameraFov,
  CameraPointing,
  OverlayBox,
} from "../ar/SkyLensProjection";

type Props = {
  nebulae: HorizontalNebula[];
  pointing: CameraPointing;
  fov: CameraFov;
  box: OverlayBox;
  visible: boolean;
  fullSphere?: boolean;
};

/**
 * Image-backed nebula artwork is intentionally disabled for now.
 *
 * The current baked assets contain opaque rectangular backgrounds on-device,
 * which makes them appear as square stickers over the sky. Keep the component
 * boundary in place so transparent, feathered assets can be restored later
 * without touching the Sky Lens screen architecture.
 */
export function NebulaImageLayer(_props: Props) {
  return null;
}
