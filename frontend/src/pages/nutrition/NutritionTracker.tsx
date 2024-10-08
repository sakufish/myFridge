import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Sidebar from '../goals&info/components/sidebar';
import SetGoal from './components/setGoal';
import MealList from './components/MealList';
import ProgressBar from './components/ProgressBar';
import CameraModal from './components/modals/CameraModal';
import UploadModal from './components/modals/UploadModal';
import TextModal from './components/modals/TextModal';
import Cookies from 'js-cookie';
import axios from 'axios';

const NutritionTracker: React.FC = () => {
  const [meals, setMeals] = useState<{ name: string; calories: number; protein: number }[]>([]);
  const [isCameraModalOpen, setCameraModalOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isTextModalOpen, setTextModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [calorieGoal, setCalorieGoal] = useState<number>(2000); // Default value
  const [proteinGoal, setProteinGoal] = useState<number>(100); // Default value

  useEffect(() => {
    const id = Cookies.get('userId');
    if (id) {
      setUserId(id);
      fetchUserData(id); // Fetch user data when userId is available
      fetchMeals(id); // Fetch meals when userId is available
    }
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await axios.get(`https://myfridge-0q77.onrender.com/api/users/${userId}`);
      const userData = response.data;

      // Set goals from user data
      setCalorieGoal(userData.calorieGoal || 2000);
      setProteinGoal(userData.proteinGoal || 100);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchMeals = async (userId: string) => {
    try {
      const response = await axios.get(`https://myfridge-0q77.onrender.com/api/users/${userId}/meals`);
      setMeals(response.data.meals || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const handleAddMeal = async (meal: { name: string; calories: number; protein: number }) => {
    try {
      // Add the meal to the database
      await axios.post(`https://myfridge-0q77.onrender.com/api/users/${userId}/meals`, meal);
      
      // Re-fetch the meals to update the list
      await fetchMeals(userId as string);
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Failed to add meal.');
    }
  };

  const handleClearMeals = async () => {
    if (!userId) {
        console.error('No userId found in cookies.');
        return;
    }

    console.log(`Attempting to clear meals for userID: ${userId}`);

    try {
        const response = await axios.delete(`https://myfridge-0q77.onrender.com/api/users/${userId}/meals/clear`);
        
        console.log('Clear meals response:', response);

        if (response.status === 200) {
            console.log('Meals cleared successfully.');
            setMeals([]); // Clear the meals array in the frontend
        } else {
            console.error('Failed to clear meals:', response.statusText);
            alert('Failed to clear meals.');
        }
    } catch (error) {
        console.error('Error clearing meals:', error);
        alert('Failed to clear meals.');
    }
  };

  const handleDeleteMeal = async (index: number) => {
    if (!userId) return;

    try {
      const response = await axios.delete(`https://myfridge-0q77.onrender.com/api/users/${userId}/meals/${index}`);
      if (response.status === 200) {
        setMeals(response.data.meals); // Update meals in the frontend
      } else {
        console.error('Failed to delete meal:', response.statusText);
        alert('Failed to delete meal.');
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Failed to delete meal.');
    }
  };

  const openCameraModal = () => setCameraModalOpen(true);
  const closeCameraModal = () => setCameraModalOpen(false);

  const openUploadModal = () => setUploadModalOpen(true);
  const closeUploadModal = () => setUploadModalOpen(false);

  const openTextModal = () => setTextModalOpen(true);
  const closeTextModal = () => setTextModalOpen(false);

  const totalCalories = meals.reduce((acc, meal) => acc + meal.calories, 0);
  const totalProtein = meals.reduce((acc, meal) => acc + meal.protein, 0);

  // Function to handle updating goals
  const handleGoalUpdate = (newCalorieGoal: number, newProteinGoal: number) => {
    setCalorieGoal(newCalorieGoal);
    setProteinGoal(newProteinGoal);
  };

  return (
    <div className="flex bg-gradient-to-tr from-[#FE94FF] to-[#FFB794] min-h-screen w-screen font-mali">
      <Helmet>
        <title>myFridge • Tracker</title> {/* Set the page title here */}
      </Helmet>

      <Sidebar />

      <div className="flex-1 p-8 flex flex-row space-x-16 items-start h-screen overflow-hidden">
        <MealList 
          meals={meals} 
          onOpenCamera={openCameraModal} 
          onOpenUpload={openUploadModal} 
          onOpenText={openTextModal} 
          onClearMeals={handleClearMeals} // Pass the clear meals handler to MealList
          onDeleteMeal={handleDeleteMeal} // Pass the delete meal handler to MealList
        />

        <div className="flex flex-col space-y-8 h-full">
          <SetGoal onGoalUpdate={handleGoalUpdate} />
          <ProgressBar
            calorieGoal={calorieGoal}
            calorieIntake={totalCalories}
            proteinGoal={proteinGoal}
            proteinIntake={totalProtein}
          />
        </div>
      </div>

      {isCameraModalOpen && userId && (
        <CameraModal
          onClose={closeCameraModal}
          userId={userId}
          onAddMeal={handleAddMeal}
        />
      )}
      {isUploadModalOpen && userId && (
        <UploadModal
          onClose={closeUploadModal}
          userId={userId}
          onAddMeal={handleAddMeal}
        />
      )}     
      {isTextModalOpen && userId && (
        <TextModal onClose={closeTextModal} onAddMeal={handleAddMeal} userId={userId} />
      )}
    </div>
  );
};

export default NutritionTracker;
