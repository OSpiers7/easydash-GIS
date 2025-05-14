import HomeTopBanner from "./HomeTopBanner";
import "../Dashboard.css";
import Modal from "./Modal";
import TiltedCard from "./TiltedCard";


import { useDispatch } from "react-redux"; // Import useDispatch
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  setSaveName,
  setSaveState,
  setUserAuth,
  clearUserAuth,
} from "../redux/actions";
import { selectIsUserLoggedIn } from "../redux/reducers";

import { supabase } from "../supabaseClient";

import UploadGeo from "./GeoJsonUpload";
import "bootstrap/dist/css/bootstrap.min.css";

import SplitText from "./SplitText";
import ShinyText from "./ShinyText";
import GlassIcons from "./GlassIcons";
import {
  FiFileText,
  FiBook,
  FiHeart,
  FiCloud,
  FiEdit,
  FiBarChart2,
} from "react-icons/fi"; // Icons
import Squares from "./Squares";
import BarLoader from "./BarLoader";
import Menu from "./Menu";


interface HomePageProps {
  onSelectDashboard: (key: string) => void;
}

interface ScreenshotMap {
  [key: string]: string; // Maps dashboard name to base64 image data
}

const HomePage: React.FC<HomePageProps> = ({ onSelectDashboard }) => {
  //the icon for the add item button

  const dispatch = useDispatch();
  // Access the saveState from the Redux store
  const SaveState = useSelector((state: any) => state.saveState);
  const isLoggedIn = useSelector(selectIsUserLoggedIn);

  const [screenshotUrls, setScreenshotUrls] = useState<ScreenshotMap>({});

  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  // Fetch screenshots from Supabase
  const fetchScreenshots = async () => {
    try {
      setShowLoader(true); // Show loader while fetching
      
      // List all files in the "screenshots" bucket
      const { data: files, error: listError } = await supabase.storage
        .from('screenshots')
        .list();

      if (listError) {
        console.error("Error listing screenshots:", listError);
        setShowLoader(false);
        return;
      }
      
      if (!files) {
        setShowLoader(false);
        return;
      }

      // Create a map of dashboard names to their base64 image data
      const imageMap: ScreenshotMap = {};
      
      for (const file of files) {
        if (!file.name.endsWith('.png')) continue;
        
        // Get the dashboard name (remove .png extension)
        const dashboardName = file.name.replace(/\.png$/, '');
        
        // Download the actual file data
        const { data, error: downloadError } = await supabase.storage
          .from('screenshots')
          .download(file.name);
          
        if (downloadError) {
          console.error(`Error downloading ${file.name}:`, downloadError);
          continue;
        }
        
        if (data) {
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(data);
          await new Promise<void>((resolve) => {
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                imageMap[dashboardName] = reader.result;
              }
              resolve();
            };
          });
        }
      }
      
      setScreenshotUrls(imageMap);
      console.log("Loaded screenshot data for", Object.keys(imageMap).length, "dashboards");
      setShowLoader(false);
    } catch (error) {
      console.error('Error fetching screenshots:', error);
      setShowLoader(false);
    }
  };

  // Remove the selected key from local storage
  const handleDeleteKey = async (keyToDelete: string) => {
    // Remove from localStorage
    localStorage.removeItem(keyToDelete);

    // Remove from Supabase storage
    const { error } = await supabase.storage
      .from("dashboards")
      .remove([`${keyToDelete}.json`, `${keyToDelete}.png`]);

    if (error) {
      console.error("Error deleting from Supabase:", error);
      return;
    }

    setKeys((prevKeys) => prevKeys.filter((key) => key !== keyToDelete));
  };

  // Update the selected key in the Redux store
  const handleButtonClick = (key: string) => {
    setShowLoader(true);
    setTimeout(() => {
      if (key === "DefaultValue") {
        onSelectDashboard(key); // Make a new dashboard with default values
        dispatch(setSaveState(""));
        dispatch(setSaveName(""));
        return;
      }
      dispatch(setSaveState("load"));
      dispatch(setSaveName(key));
      onSelectDashboard(key); // Navigate to dashboard
    }, 1000);
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        dispatch(
          setUserAuth({
            email: session.user.email || "",
            isAuthenticated: true,
          })
        );
        console.log("User session restored:", session.user.email);
      }
    };

    checkSession();

    // Also set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        dispatch(
          setUserAuth({
            email: session.user.email || "",
            isAuthenticated: true,
          })
        );
      } else if (event === "SIGNED_OUT") {
        dispatch(clearUserAuth());
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Access the dashboard names from the Redux store
  useEffect(() => {
    const getAllLocalStorageKeys = () => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith("sb-") && !key.includes("token")) {
          keys.push(key);
        }
      }
      return keys;
    };

    setKeys(getAllLocalStorageKeys());
    fetchScreenshots();
  }, []);

  const [keys, setKeys] = useState<string[]>([]);
  const [showLoader, setShowLoader] = useState(false);

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  // Update the keys when data is pulled from the database
  useEffect(() => {
    if (SaveState[0] === "sync") {
      const updateLocalStorageKeys = () => {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !key.startsWith("sb-")) {
            keys.push(key);
          }
        }
        setKeys(keys);
      };

      updateLocalStorageKeys();
    }
  }, [SaveState]);

  return (
    <div className="w-screen min-h-screen relative bg-[#181818] pt-0 pb-40 z-0">
      {showLoader && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center">
          <BarLoader />
        </div>
      )}
      {/* BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 w-full min-h-full bg-[#181818] bg-[length:40px_40px] bg-[url('/world.svg'),linear-gradient(to_right,#ffffff11_1px,transparent_1px),linear-gradient(to_bottom,#ffffff11_1px,transparent_1px)] bg-cover bg-center ">
        {/* The SVG file will act as the background */}
      </div>
      {/* FOREGROUND CONTENT */}
      <div className="relative z-10">
        {/* CALL FOR THE TOP BANNER */}
        <div className="fixed top-0 left-0 w-full z-50 mt-[20px]">
          <HomeTopBanner
            loginUser={() => {
              setIsDropDownOpen(true);
            }}
          />

          <Menu
            isDropDownOpen={isDropDownOpen}
            setIsDropDownOpen={setIsDropDownOpen}
          />
        </div>

        <div className="flex justify-center items-start mt-[145px]">
          <div className="flex flex-col items-center text-center w-full">
            <ShinyText
              text="Welcome to"
              disabled={false}
              speed={5}
              className="custom-class text-3xl mb-[-40px] font-semibold"
            />

            <SplitText
              text="Easy-Dash"
              className="text-[200px] font-semibold text-center mb-[-10px] text-[#D8CAB8] text-shadow-md"
              delay={150}
              animationFrom={{
                opacity: 0,
                transform: "translate3d(0,50px,0)",
              }}
              animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
              easing="easeOutCubic"
              threshold={0.2}
              rootMargin="-50px"
              onLetterAnimationComplete={handleAnimationComplete}
            />

            <ShinyText
              text={
                "Open-source GIS mapping made simple,\n powerful, and ready for your data."
              }
              disabled={false}
              speed={5}
              className="custom-class text-3xl font-semibold"
            />
          </div>
        </div>

        {/* Create New Dashboard Section 
        
            <div
              className="ml-[300px]"
              style={{ height: "200px", position: "relative" }}
            >
              <GlassIcons items={items} className="custom-class " />
            </div>
            
            */}

        <div className="flex justify-center items-start mt-[80px]">
          <div className="flex flex-col items-center text-center w-full">
            <button
              className=" text-[25px] rounded-2xl border-2 border-black bg-[#F0B5A3] px-4 py-[30px] font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_black] hover:bg-[#F0B5A3] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
              onClick={() => handleButtonClick("DefaultValue")}
            >
              Create a Dashboard
            </button>
          </div>
        </div>

        <div className="mt-[200px] w-full flex flex-col items-center">
          <div className="w-[calc(100vw-400px)] mx-auto">
            <h3 className="text-center w-full text-[#D8CAB8] font-semibold text-[60px] mb-[75px]">
              Load a dashboard
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-[100px] gap-y-[50px]">
            {keys.length === 0 ? (
              <div className="alert alert-warning" role="alert">
                No available dashboards
              </div>
            ) : (
              keys.map((key, index) => (
                <div key={key} className="relative">
                  <div
                    onClick={() => handleButtonClick(key)}
                    className="cursor-pointer"
                  >
                    <TiltedCard
                      imageSrc={
                        screenshotUrls[key] ||
                        "https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58"
                      }
                      altText=""
                      captionText=""
                      containerHeight="335px"
                      containerWidth="530px"
                      imageHeight="335px"
                      imageWidth="530px"
                      rotateAmplitude={12}
                      scaleOnHover={1.2}
                      showMobileWarning={false}
                      showTooltip={true}
                      displayOverlayContent={true}
                      overlayContent={
                        <div className="flex  w-full items-start justify-between ">
                          <span className="text-[#D8CAB8] font-semibold text-[20px] flex-1 break-words mt-2 ">
                            {key}
                          </span>

                          {isLoggedIn && (
                            <button
                              className="bg-transparent text-black p-2 focus:outline-none absolute right-0"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent parent click
                                handleDeleteKey(key);
                              }}
                              title={`Delete "${key}"`}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Footer Section */}
        <div className="w-full mt-auto py-2 bg-transparent text-center text-[#D8CAB8] z-10">
          <p className="text-lg"> &copy; Salisbury University</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
