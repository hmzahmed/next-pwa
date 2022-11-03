"use client";
import axios from "axios";
import { openDB } from "idb";
import { useEffect, useState } from "react";

const storeName = "videoLibrary";
const videoLink =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/ForBiggerJoyridesVideo.mp4";
export default function VideoLibrary() {
  const [state, setState] = useState<any>();

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
    }).then(async (response) => {
      const blob = new Blob([response.data]);
      return (await getIndexedDb()).put(storeName, blob, "video");
      // const urlObject = window.URL.createObjectURL(blob);
      // console.log(urlObject, response);
      // const link = document.createElement("a");
      // link.href = urlObject;
      // setState(blob);
      // link.setAttribute("download", "recording.mp4");
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
    });
  };

  const getBlobLink = async () => {
    const blob = await (await getIndexedDb()).get(storeName, "video");
    return blob;
  };

  useEffect(() => {
    getBlobLink().then((val) => {
      const url = val ? window.URL.createObjectURL(val) : undefined;
      console.log(url);
      setState(url);
    });
  }, []);

  return (
    <div>
      {state !== undefined && (
        <video controls>
          <source src={state} type="video/mp4 " />
        </video>
      )}

      <button style={{ width: "100%", height: "40px" }} onClick={downloadVideo}>
        Download
      </button>
    </div>
  );
}
