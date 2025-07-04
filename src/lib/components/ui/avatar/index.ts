import Root from "./avatar.svelte";
import Fallback from "./avatar-fallback.svelte";

export { Root, Root as Avatar, Fallback, Fallback as AvatarFallback };

export type {
  Root as AvatarProps,
  Fallback as AvatarFallbackProps,
} from "./index.js";
