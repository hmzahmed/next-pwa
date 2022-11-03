"use client";
import axios from "axios";
import { openDB } from "idb";
import { useEffect, useState } from "react";

const storeName = "videoLibrary";
const videoLink =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/BigBuckBunnyVideo.mp4";
export default function VideoLibrary() {
  const [state, setState] = useState<any>();
  const [downloadProgress, setDownloadProgress] = useState(0);

  const getIndexedDb = async () => {
    const db = await openDB("videoLibrary-store", 1, {
      upgrade(db) {
        db.createObjectStore(storeName);
      },
    });

    return db;
  };

  const downloadVideo = () => {
    axios({
      url: videoLink,
      method: "GET",
      responseType: "blob",
      onDownloadProgress(progressEvent) {
        setDownloadProgress(
          (progressEvent.loaded / (progressEvent.total ?? 1)) * 100
        );
      },
    }).then(async (response) => {
      console.log("Downloading");
      const blob = new Blob([response.data]);
      console.log("Downloading Complete");

      (await getIndexedDb()).put(storeName, blob, "video");
      setBlobLink();
    });
  };

  const getBlobLink = async () => {
    const blob = await (await getIndexedDb()).get(storeName, "video");
    return blob;
  };

  const setBlobLink = () => {
    getBlobLink().then((val) => {
      const url = val ? window.URL.createObjectURL(val) : undefined;
      console.log(url);
      setState(url);
    });
  };

  useEffect(() => {
    setBlobLink();
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {state !== undefined && (
        <video controls width={600}>
          <source src={state} type="video/mp4 " />
        </video>
      )}

      <button style={{ width: "90%", height: "40px" }} onClick={downloadVideo}>
        Download
      </button>
      <div
        style={{
          width: "90%",
          height: "50px",
          overflow: "hidden",
          position: "relative",
          borderRadius: "20px",
          backgroundColor: "gray",
          margin: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "green",
            width: `${downloadProgress + "%"}`,
            height: "100%",
            zIndex: 5,
          }}
        />
        <h1 style={{ fontSize: "1.5em" }} className="center">
          {Math.floor(downloadProgress) + "%"}
        </h1>
      </div>
    </div>
  );
}
