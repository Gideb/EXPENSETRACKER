import { useRef, useState, useEffect } from 'react';
import { LuTrash, LuUpload, LuUser } from 'react-icons/lu';

const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (typeof image === 'string') {
      setPreviewUrl(image);
    }
  }, [image]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImage(file);

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const showImage = previewUrl;

  return (
    <div className="flex justify-between mb-6">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!showImage ? (
        <div className="w-20 h-20 flex items-center justify-center bg-purple-100 rounded-full relative">
          <LuUser className="text-4xl text-primary cursor-pointer" />

          <button
            type="button"
            className="w-8 h-8 cursor-pointer flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1"
            onClick={onChooseFile}
          >
            <LuUpload className='cursor-pointer' />
          </button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={showImage}
            alt="profile photo"
            className="w-20 h-20 rounded-full object-cover"
          />

          <button
            className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer"
            type="button"
            onClick={handleRemoveImage}
          >
            <LuTrash className='cursor-pointer' />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelector;
