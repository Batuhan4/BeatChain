import React from 'react';

const Upload = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Upload Track</h1>
      <form>
        <div className="mb-4">
          <label htmlFor="title" className="block text-lg font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="artist" className="block text-lg font-bold mb-2">
            Artist
          </label>
          <input
            type="text"
            id="artist"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="file" className="block text-lg font-bold mb-2">
            Track
          </label>
          <input
            type="file"
            id="file"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default Upload;
