import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import Sidebar from '../goals&info/components/sidebar';
import CameraModal from './components/CameraModal';
import UploadModal from './components/UploadModal';
import TextModal from './components/TextModal';
import CameraIcon from './assets/Group 22.png';
import UploadIcon from './assets/Upload.png';
import AddIcon from './assets/Vector.png';
import Cookies from 'js-cookie';
import axios from 'axios';

const Fridge: React.FC = () => {
  const [isCameraModalOpen, setCameraModalOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isTextModalOpen, setTextModalOpen] = useState(false);
  const [fridgeItems, setFridgeItems] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = Cookies.get('userId');
    if (id) {
      setUserId(id);
      fetchFridgeItems(id); // Fetch fridge items when userId is available
    }
  }, []);

  const fetchFridgeItems = async (userId: string) => {
    try {
      const response = await axios.get(`https://myfridge-0q77.onrender.com/api/users/${userId}/fridge`);
      setFridgeItems(response.data.fridge || []);
    } catch (error) {
      console.error('Error fetching fridge items:', error);
    }
  };

  const openCameraModal = () => setCameraModalOpen(true);
  const closeCameraModal = () => setCameraModalOpen(false);

  const openUploadModal = () => setUploadModalOpen(true);
  const closeUploadModal = () => setUploadModalOpen(false);

  const openTextModal = () => setTextModalOpen(true);
  const closeTextModal = () => setTextModalOpen(false);

  const handleAddItem = async (item: string) => {
    try {
      await axios.post(`https://myfridge-0q77.onrender.com/api/users/${userId}/fridge`, { item });
      await fetchFridgeItems(userId as string);
    } catch (error) {
      console.error('Error adding item to fridge:', error);
      alert('Failed to add item.');
    }
  };

  const handleRemoveItem = async (itemToRemove: string) => {
    try {
      await axios.delete(`https://myfridge-0q77.onrender.com/api/users/${userId}/fridge/${itemToRemove}`);
      setFridgeItems(fridgeItems.filter(item => item !== itemToRemove));
    } catch (error) {
      console.error('Error removing item from fridge:', error);
      alert('Failed to remove item.');
    }
  };

  return (
    <div className="flex bg-gradient-to-tr from-[#9C9AF3] to-[#FDD1E2] min-h-screen w-screen font-mali">
      <Helmet>
        <title>myFridge • Fridge</title> {/* Set the page title here */}
      </Helmet>
      <Sidebar />
      <div className="flex-1 flex p-8">
        <div className="w-full h-full bg-gray-100 rounded-lg shadow-lg p-8 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-semibold">Fridge</h1>
            <div className="flex space-x-4">
              <img src={UploadIcon} alt="Upload Icon" className="w-8 h-8 cursor-pointer object-contain" onClick={openUploadModal} />
              <img src={CameraIcon} alt="Camera Icon" className="w-8 h-8 cursor-pointer object-contain" onClick={openCameraModal} />
              <img src={AddIcon} alt="Add Icon" className="w-8 h-8 cursor-pointer object-contain" onClick={openTextModal} />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 bg-gray-300 p-6 rounded-lg shadow-inner overflow-auto">
            {fridgeItems.length === 0 ? (
              <p className="text-gray-500 text-center mt-4">Your fridge is empty. Start by adding an item.</p>
            ) : (
              <div className="flex flex-wrap items-start gap-2"> {/* Modified flex settings */}
                {fridgeItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 px-3 py-1 rounded-full shadow-[0_3px_3px_rgba(0,0,0,0.3)] transition-transform transform hover:translate-y-[-2px] h-10"
                  >
                    <span>{item}</span>
                    <div onClick={() => handleRemoveItem(item)} className="cursor-pointer ml-2 text-gray-600 hover:text-gray-900">
                      ×
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isCameraModalOpen && userId && (
        <CameraModal 
          onClose={closeCameraModal} 
          userId={userId} 
          onAddItem={handleAddItem} 
        />
      )}
      {isUploadModalOpen && userId && (
        <UploadModal 
          onClose={closeUploadModal} 
          userId={userId} 
          onAddItem={handleAddItem} 
        />
      )}
      {isTextModalOpen && userId && (
        <TextModal 
          onClose={closeTextModal} 
          onAddItem={handleAddItem} 
          userId={userId} 
        />
      )}
    </div>
  );
};

export default Fridge;
