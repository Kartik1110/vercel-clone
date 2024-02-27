import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

type DeployementType = {
  gitURL: string;
  slug: string;
};
type DeployementResponseType = {
  url: string;
  projectSlug: string;
};

export default function Home() {
  const [logs, setLogs] = useState("");
  const [inputData, setInputData] = useState<DeployementType>({ gitURL: "", slug: "" });
  const [deployResponse, setDeployResponse] = useState<DeployementResponseType>();

  const onDeployHandler = () => {
    axios
      .post("http://localhost:9000/api/project", {
        gitURL: inputData?.gitURL,
        slug: inputData?.slug,
      })
      .then(function (response) {
        setDeployResponse(response.data.data);
      })
      .catch(function (error) {
        console.log(error);
      });
    setLogs(`🌱 Preparing for deployement...\n`);
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:9001");

    socket.onopen = () => {
      console.log("WebSocket connection established.");
    };

    socket.onmessage = (event) => {
      setLogs(`${event.data}\n`);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <main className={`flex min-h-screen flex-col items-center justify-evenly p-24 ${inter.className} text-center`}>
      <div className="relative">
        <div className="absolute inset-0 before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/2 after:bg-gradient-conic after:from-transparent after:via-purple-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-purple-700/10 after:dark:from-sky-900 after:dark:via-[#8a00ff]/40 before:lg:h-[360px]"></div>
        <h1 className="p-2 text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-green-600">
          This is an
          <span className="p-2 glowing-text text-6xl font-extrabold">One Click</span>
        </h1>
        <h1 className="p-2 text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-green-600">
          deployment solution for all your web applications.
        </h1>
      </div>
      <div className="overflow-y-auto flex flex-col items-center p-4 h-auto h-max-[70vh] w-[80vh] border border-gray-600 rounded-lg bg-opacity-5 bg-gray-500 backdrop-blur-sm hover:border hover:border-gray-300">
        <input
          className="w-[90%] p-2 mt-2 text-lg text-white bg-transparent border border-gray-600 rounded-lg bg-opacity-5"
          type="text"
          value={inputData?.gitURL}
          onChange={(e) => setInputData({ ...inputData, gitURL: e.target.value })}
          placeholder="Enter your GitHub URL"
        />
        <input
          className="w-[90%] p-2 mt-2 text-lg text-white bg-transparent border border-gray-600 rounded-lg bg-opacity-5"
          type="text"
          value={inputData?.slug}
          onChange={(e) => setInputData({ ...inputData, slug: e.target.value })}
          placeholder="Enter your slug(optional)"
        />
        <button
          className="p-2 my-4 rounded-lg text-lg font-semibold text-black bg-gradient-to-r from-yellow-400 to-green-600 hover:rounded-xl disabled:cursor-not-allowed"
          onClick={onDeployHandler}
          disabled={!inputData?.gitURL}
        >
          DEPLOY
        </button>
        <h3 className="float-start text-white text-lg">{logs}</h3>
        {deployResponse && (
          <h3 className="float-start text-white text-lg">
            🔥 Project link - {deployResponse?.url}
            <a className="text-white hover:cursor-pointer" href={deployResponse?.url} target="_blank">
              🔗
            </a>
          </h3>
        )}
      </div>
    </main>
  );
}
