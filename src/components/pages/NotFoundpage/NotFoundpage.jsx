import React from 'react';
import './NotFoundpage.css';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { PATH_NAME } from '../../../router/Pathname';
import LeftArrow from '../../../assets/Icon_line/Arrow_Left_LG.svg'

export default function NotFoundpage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const handleGoBack = () => {
    if (role === 'admin') {
      navigate(PATH_NAME.ADMIN_DASHBOARD);
    } else if (role === 'mod') {
      navigate(PATH_NAME.MODERATOR_DASHBOARD);
    } else {
      navigate(PATH_NAME.HOMEPAGE);
    }
  };

  return (
    <>
      <div className='notfound-header-btn oxanium-semibold backdrop-blur-lg border border-white/10 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-100  active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer hover:border-white/30 hover:bg-gradient-to-tr hover:from-white/10 hover:to-black/40 group relative overflow-hidden' 
      onClick={handleGoBack}>
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
        ></div>
        <img
          src={LeftArrow}
          alt="LeftArrow icon"
          className='notfound-header-icon'
        />
        Go back
      </div>

      <div className='notfound-container '>
        <div className="notfound-card">
          <p className="notfound-message oxanium-bold">Page Not Found</p>
          <div className="notfound-title">
            <div className="notfound-item">
              <span aria-hidden="true">4O4</span>
              <span aria-hidden="true" className="notfound-glitch">4O4</span>
              <span aria-hidden="true" className="notfound-glitch notfound-glitch--secondary">4O4</span>
            </div>
            <div className="notfound-item">
              <span aria-hidden="true">Error</span>
              <span aria-hidden="true" className="notfound-glitch">notfound</span>
              <span aria-hidden="true" className="notfound-glitch error-glitch--secondary">Error</span>
            </div>
          </div>
          <div className="notfound-description">The requested page could not be found</div>
        </div>
      </div>
    </>
  );
}
