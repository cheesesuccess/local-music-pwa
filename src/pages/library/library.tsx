import React, { useEffect, useState } from "react";

const Library = () => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetch("/songs.json")
      .then((res) => res.json())
      .then((data) => setSongs(data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Library</h1>
      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <strong>{song.title}</strong> by {song.artist}
            <br />
            <audio controls src={song.url} style={{ width: "100%" }} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Library;
