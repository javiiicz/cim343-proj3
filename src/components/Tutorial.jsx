import myImage from "../assets/warioware.webp";

const Tutorial = ({ toggleTutorial, colors, index }) => {
    return (
        <div className='bg-black/50 w-full h-screen absolute flex items-center justify-center'>
            <div className='bg-white rounded-xl drop-shadow-md w-[400px] p-6 flex flex-col gap-2 items-center border-2 border-solid border-red-500'>
                <h3 className='font-bold w-full underline decoration-rose-400'>Welcome to Move It! 🪩🕺</h3>

                <img src={myImage} className='h-30 object-contain'/>

                <p className='font-medium text-sm'>In this game, a series of images will be shown to you and you have to match the pose as fast as possible! This game utilizes your device's camera, and it works best with your whole upper body in view. Will you become the dance champion?</p>

                <div onClick={toggleTutorial} className={`flex items-center justify-center overflow-hidden h-10 w-[50%] cursor-pointer rounded-2xl ${colors[index % colors.length]}`}>
                    <a className='text-center text-sm text-white font-bold'>Hide</a>
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
