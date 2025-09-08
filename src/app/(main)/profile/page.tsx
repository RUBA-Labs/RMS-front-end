import { MainContainer } from "./components/profile-main-container";
import { ProfileHeader } from "./components/ProfileHeader";


export default function Profile() {
  return (

    <>
      <MainContainer>
        <ProfileHeader />
        <div className="flex items-center pl-4 pt-4 pb-2">
          <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 mr-4">
            My Profile
          </h3>
          <div className="flex-1 h-px bg-gray-200/20" />
        </div>
      </MainContainer>
    </>
  );
}