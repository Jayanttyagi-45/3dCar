import Car360Viewer from "@/components/Car360Viewer";

const CAR_360_FOLDER = "https://naver.github.io/egjs-axes/img/demos/car360/";
const CAR_360_FILENAME_PATTERN = "beatle ({index}).png";
const CAR_360_FRAME_COUNT = 36;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16 font-sans">
      <div className="w-full max-w-5xl">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
          360&deg; Car Viewer
        </h1>

        <div className="mt-10">
          <Car360Viewer
            folder={CAR_360_FOLDER}
            filenamePattern={CAR_360_FILENAME_PATTERN}
            frameCount={CAR_360_FRAME_COUNT}
            alt="360 degree rotating view of a car"
          />
        </div>
      </div>
    </div>
  );
}
