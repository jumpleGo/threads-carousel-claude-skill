import { Composition } from "remotion";
import { HookVideo, hookVideoSchema, defaultHookProps } from "./HookVideo";
import { FORMAT_PRESETS } from "../lib/presets";

const DURATION_SEC = 5;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {(Object.keys(FORMAT_PRESETS) as Array<keyof typeof FORMAT_PRESETS>).map(
        (fid) => {
          const f = FORMAT_PRESETS[fid];
          return (
            <Composition
              key={fid}
              id={`Hook-${fid}`}
              component={HookVideo}
              durationInFrames={DURATION_SEC * FPS}
              fps={FPS}
              width={f.w}
              height={f.h}
              schema={hookVideoSchema}
              defaultProps={{ ...defaultHookProps, formatId: fid }}
            />
          );
        }
      )}
    </>
  );
};
