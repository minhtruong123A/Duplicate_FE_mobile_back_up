/* eslint-disable no-unused-vars */
import { React, useEffect, useState, useCallback } from 'react';
import './Profilepage.css';
import { Snackbar, Alert } from '@mui/material';
import MessageModal from '../../libs/MessageModal/MessageModal';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getProfile, getOtherProfile, getAllProductOnSaleOfUser, createReport } from '../../../services/api.user';
import { format } from 'date-fns';
import { buildImageUrl } from '../../../services/api.imageproxy';
import SwitchTabs from '../../libs/SwitchTabs/SwitchTabs';
import UserOnSale from '../../tabs/UserOnSale/UserOnSale';
import UserAchievements from '../../tabs/UserAchievements/UserAchievements';
import UserBox from '../../tabs/UserBox/UserBox';
import UserCollectionList from '../../tabs/UserCollectionList/UserCollectionList';
// import assets
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import MessageIcon from "../../../assets/Icon_fill/comment_fill.svg";
import FollowIcon from "../../../assets/Icon_line/User_add.svg";
import EditProfileIcon from "../../../assets/Icon_line/User_Card_ID.svg";
import ReportIcon from "../../../assets/Icon_line/warning-error.svg";
import CopyLinkIcon from "../../../assets/Icon_line/link_alt.svg";
import { followUser, getFollowers, getFollowing, unfollowUser } from '../../../services/api.subscription';
import { Modal } from 'antd';

export default function Profilepage() {
  const { id } = useParams();
  const user = useSelector(state => state.auth.user);
  const currentUserId = user?.user_id;
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);
  const [followSuccess, setFollowSuccess] = useState(false);
  const [profile, setProfile] = useState(null);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [activeTab, setActiveTab] = useState('Mystery Boxes');
  const [hasFollowed, setHasFollowed] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  // Show warning modal for unauthorized actions using MessageModal
  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        // If id exists and (user is guest or id !== currentUserId), show other profile
        if (id && (!currentUserId || id !== currentUserId)) {
          res = await getOtherProfile(id);
        } else if (currentUserId) {
          res = await getProfile();
        } else {
          setError('You must be logged in to view your own profile.');
          setLoading(false);
          return;
        }
        if (res && res.status) {
          setProfile(res.data);
        } else {
          setError('Profile not found');
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    // Always allow fetching other profiles, only block my profile if not logged in
    if (id || typeof currentUserId !== 'undefined') {
      fetchProfile();
    }
  }, [id, currentUserId]);

  // Move fetchSocialData outside so it can be reused
  const fetchSocialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [followersRes, followingRes] = await Promise.all([
        getFollowers(),
        getFollowing(),
      ]);
      const followersData = followersRes.data || [];
      const followingData = followingRes.data || [];
      console.log(followersData)
      setFollowers(followersData);
      setFollowing(followingData);
      if (id && followingData.some((user) => user.userId === id)) {
        setHasFollowed(true);
      } else {
        setHasFollowed(false);
      }
    } catch (error) {
      console.error("❌ Lỗi khi fetch followers/following:", error);
    }
    finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSocialData();
  }, [fetchSocialData]);
  // Refetchable fetchProducts for on-sale products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const userId = id || currentUserId;
      if (userId) {
        const res = await getAllProductOnSaleOfUser(userId);
        if (res && res.status) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    }
    setProductsLoading(false);
  }, [id, currentUserId]);

  useEffect(() => {
    if (id || currentUserId) {
      fetchProducts();
    }
  }, [id, currentUserId, fetchProducts]);

  if (loading || isLoading) return (
    <div className="w-full">
      {/* Banner skeleton */}
      <div className="w-full h-52 skeleton rounded-none bg-gray-700/30" />

      {/* Profile Info Skeleton */}
      <div className="profilepage-wrapper">
        <div className="profilepage-img avatar">
          <div className="profilepage-avatar-container">
            <div className="skeleton w-full h-full rounded bg-gray-700/40 backdrop-blur-sm" />
          </div>
        </div>

        <div className="profilepage-info">
          {/* Left skeleton info */}
          <div className="profilepage-left space-y-4">
            <div className="space-y-2">
              <div className="skeleton h-6 w-40 bg-gray-600/40 rounded" />
              <div className="skeleton h-4 w-24 bg-gray-600/30 rounded" />
            </div>

            <div className="flex gap-3">
              <div className="skeleton h-10 w-32 rounded bg-gray-600/30" />
              <div className="skeleton h-10 w-32 rounded bg-gray-600/30" />
            </div>
          </div>

          {/* Right skeleton action */}
          <div className="profilepage-right-action flex gap-3">
            <div className="skeleton h-10 w-32 rounded bg-gray-600/30" />
            <div className="skeleton h-10 w-32 rounded bg-gray-600/30" />
          </div>
        </div>
      </div>

      {/* Tabs switcher skeleton */}
      <div className="tabs-switcher-section flex flex-col gap-3">
        {/*Show 3 skeleton tabs if viewing own profile, else 2 */}
        <div className="flex justify-center gap-4">
          {[...Array(
            (id === currentUserId || !id) && currentUserId ? 3 : 2
          )].map((_, i) => (
            <div key={i} className="skeleton h-10 w-28 bg-gray-700/20 rounded" />
          ))}
        </div>
        <div className="skeleton h-60 w-[90%] rounded bg-gray-700/40" />

      </div>
    </div>
  );

  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  if (!profile) return <div className="text-center mt-10 text-gray-400">No profile data found.</div>;

  const isMyProfile = currentUserId && (id === currentUserId || !id);

  // Construct the tabs array based on isMyProfile
  const tabs = isMyProfile
    ? [
      {
        label: 'Mystery Boxes',
        content: <UserBox />,
      },
      {
        label: 'Collections',
        content: <UserCollectionList refreshOnSaleProducts={fetchProducts} />,
      },
      {
        label: 'On Sale',
        content: <UserOnSale products={products} productsLoading={productsLoading} />,
      },
    ]
    : [
      {
        label: 'Collections',
        content: <UserAchievements />,
      },
      {
        label: 'On Sale',
        content: <UserOnSale products={products} productsLoading={productsLoading} />,
      },
    ];

  // change createDate format to month year  
  const joinedDate = format(new Date(profile.createDate), 'MMMM yyyy');

  // Function to copy current domain
  const handleCopyProfileLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setCopySuccess(true); // show snackbar
      })
      .catch((err) => {
        console.error("Failed to copy profile link:", err);
      });
  };

  const handleFollowToggle = async () => {
    try {
      if (hasFollowed) {
        await unfollowUser(id);
        console.log("Đã hủy theo dõi!");
      } else {
        await followUser(id);
        console.log("Đã theo dõi!");
        setFollowSuccess(true); // Show success snackbar nếu cần
      }

      await fetchSocialData(); // Cập nhật lại trạng thái theo dõi
    } catch (error) {
      console.error("❌ Lỗi khi xử lý theo dõi / hủy theo dõi:", error);
    }
  };

  // Function to submit Report form
  const handleSubmitReport = async () => {
    if (!reportTitle || !reportContent) {
      return showModal('warning', 'Missing field', "Please fill in both Title and Content");;
    }

    try {
      setReportSubmitting(true);
      const res = await createReport({
        sellProductId: "null",
        sellerId: id,
        title: reportTitle,
        content: reportContent,
      });

      if (res?.success || res?.status) {
        showModal('default', 'Report sent', "The report has been sent to the higher-ups for processing.");
        setShowReportModal(false);
        setReportTitle('');
        setReportContent('');
      } else {
        return showModal('error', 'Error', "Report fail to sent. Invalid response");
      }
    } catch (err) {
      console.error("Report error:", err);
      return showModal('error', 'Error', "Something wrong! Please try again later.");
    } finally {
      setReportSubmitting(false);
    }

  };



  return (
    <div>
      {/* Head profile */}
      <div className="w-full">
        {/* Top banner */}
        <div
          className="profilepage-banner"
          style={{
            backgroundImage: `url(https://i.pinimg.com/736x/86/87/d2/8687d2981dd01ed750fae1a55830735e.jpg)`,
          }}
        />

        {/* Profile Info Section */}
        <div className="profilepage-wrapper">
          {/* Profile image */}
          <div className="profilepage-img avatar">
            <div className="profilepage-avatar-container">
              <img
                src={
                  profile.profileImage
                    ? buildImageUrl(profile.profileImage, useBackupImg)
                    : ProfileHolder
                }
                onError={() => setUseBackupImg(true)}
                alt="Profile"
                className="profilepage-avatar"
              />
            </div>
          </div>

          {/* Info & actions */}
          <div className="profilepage-info">
            {/* Left info */}
            <div className="profilepage-left">
              <div className='profilepage-nameJoin'>
                <h1 className="profilepage-username oxanium-bold">{profile.username}</h1>
                <p className='profilepage-joinTime oxanium-semibold'> Join <span className='oxanium-regular'>{joinedDate}</span></p>
              </div>

              <div className="profilepage-buttons">
                {isMyProfile ? (
                  <>
                    <button
                      className="profilepage-btn-follow oxanium-semibold"
                      onClick={() => navigate('/settingpage')}
                    >
                      <img src={EditProfileIcon} alt="Edit" className="profilepage-follow-icon" />
                      Edit profile
                    </button>

                    <button
                      className="profilepage-btn-viewfollows oxanium-semibold"
                      onClick={() => setIsFollowModalOpen(true)}
                    >
                      Followers / Following
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="profilepage-btn-follow oxanium-semibold"
                      onClick={handleFollowToggle}
                    >
                      <img
                        src={FollowIcon}
                        alt="Follow"
                        className="profilepage-follow-icon"
                      />
                      {hasFollowed ? "Following" : "Follow"}
                    </button>
                    <button
                      className="profilepage-btn-message oxanium-semibold"
                      onClick={() => {
                        if (!user || !user.user_id) {
                          showModal('warning', 'Unauthorized', "Bạn cần đăng nhập để nhắn tin.");
                          return;
                        }
                        if (!id) {
                          showModal('warning', 'Error', "Không tìm thấy user để nhắn tin.");
                          return;
                        }
                        navigate(`/chatroom/${id}`);
                      }}
                    >
                      <img src={MessageIcon} alt="Message" className="profilepage-message-icon" />
                      Message
                    </button>
                  </>
                )}
              </div>
              <Modal
                title="Followers & Following"
                open={isFollowModalOpen}
                onCancel={() => setIsFollowModalOpen(false)}
                footer={null}
              >
                <div>
                  <h4>Followers</h4>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {followers.length > 0 ? (
                      followers.map((follower) => (
                        <li key={follower.followerId} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                          <img
                            src={buildImageUrl(follower.urlImage, useBackupImg)}
                            onError={() => setUseBackupImg(true)}
                            alt={follower.followerName}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              marginRight: 8,
                              objectFit: "cover",
                            }}
                          />
                          <span>{follower.followerName}</span>
                        </li>
                      ))
                    ) : (
                      <li>Chưa có ai theo dõi</li>
                    )}
                  </ul>

                  <h4 style={{ marginTop: 16 }}>Following</h4>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {following.length > 0 ? (
                      following.map((followed) => (
                        <li key={followed.followerId} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                          <img
                            src={buildImageUrl(followed.urlImage, useBackupImg)}
                            onError={() => setUseBackupImg(true)}
                            alt={followed.userName}
                            style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 8, objectFit: "cover" }}
                          />
                          <span>{followed.userName}</span>
                        </li>
                      ))
                    ) : (
                      <li>Chưa theo dõi ai</li>
                    )}
                  </ul>
                </div>
              </Modal>




            </div>

            {/* Right extra buttons */}
            <div className="profilepage-right-action">
              {isMyProfile ? '' : (
                <button className="profilepage-btn-report oxanium-semibold"
                  onClick={() => {
                    if (!user || user.role !== 'user') {
                      showModal('warning', 'Unauthorized', "You're not permitted to execute this action");
                      return;
                    }
                    setShowReportModal(true);
                  }}
                >
                  <img src={ReportIcon} alt="Report" className="profilepage-report-icon" />
                  Report
                </button>
              )}
              <button className="profilepage-btn-copy oxanium-semibold" onClick={handleCopyProfileLink}>
                <img src={CopyLinkIcon} alt="Copy" className="profilepage-copyLink-icon" />
                Copy profile link
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Tabs switcher */}
      <div className='tabs-switcher-section'>
        <SwitchTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(label) => setActiveTab(label)}
        />
      </div>


      {/* Report modal */}
      {showReportModal && (
        <div className="report-modal-overlay">
          <div className="report-modal-container">
            <div className="report-modal-box">
              <h3 className='report-modal-header oleo-script-bold'>Report this account</h3>
              <input
                type="text"
                placeholder="Title"
                className='oxanium-regular'
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
              <textarea
                placeholder="Content"
                className='oxanium-regular'
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
              />
              <div className="report-modal-actions oxanium-bold">
                <button onClick={() => setShowReportModal(false)}>Cancel</button>
                <button onClick={handleSubmitReport} disabled={reportSubmitting}>
                  {reportSubmitting ?
                    <span className="loading loading-bars loading-md"></span>
                    :
                    'Submit report'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Success copy profile link snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success" sx={{ width: '100%' }}>
          Profile link copied to clipboard!
        </Alert>
      </Snackbar>

      {/* Success follow snackbar */}
      <Snackbar
        open={followSuccess}
        autoHideDuration={3000}
        onClose={() => setFollowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setFollowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Đã theo dõi thành công!
        </Alert>
      </Snackbar>

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
