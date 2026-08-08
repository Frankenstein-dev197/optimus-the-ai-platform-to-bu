import type { Theme as OptimusIDECollabTheme } from "#/theme";

declare module "@emotion/react" {
        interface Theme extends OptimusIDECollabTheme {}
}
