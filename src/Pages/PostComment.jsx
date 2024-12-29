import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  HeartIcon,
  DmIcon,
  RetweetIcon,
  Coment,
  UserIcon2,
} from "../Components/Common/Icon";
import BackBtn from "../Components/post/BackBtn";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../Contexts/AuthContext";
import fetchUserProfileImage from "../Utils/fetchProfile";

const AllWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Backarea = styled.div`
  display: flex;
  margin-right: 730px;
`;
const BoederWrapper = styled.div`
  position: fixed;
  bottom: 0;
  width: 680px;
  height: 85%;
  border-radius: 40px 40px 0px 0px;
  background: ${(props) => props.theme.borderColor};
  box-shadow: ${(props) => props.theme.bordershadow};
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 전체 높이를 고정 */
  scrollbar-width: none;
  max-height: auto; /* 고정된 높이를 주어야 스크롤이 발생함 */
  overflow-y: auto; /* 스크롤을 활성화 */
  ::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 768px) {
    position: fixed;
    border-radius: 0;
    width: 100%;
    height: calc(100% - 140px);
    bottom: 70px;
    box-shadow: none;
    border-radius: 0px 0px 0px 0px;
  }
`;

const PostWrapper = styled.div`
  position: sticky;
  top: 0;
  left: 0px;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.borderColor};
  padding: 40px;
  border-radius: 40px 40px 0 0;
  border-bottom: 1px solid ${(props) => props.theme.comentBouttomLine};
  z-index: 20;
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    padding: 20px;
    border-radius: 0;
  }
`;
const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
`;
const UserImage = styled.img`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
`;
const Username = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.fontcolor};
`;
const Timer = styled.span`
  flex: 1;
  font-size: 10px;
  color: #9a9a9a;
`;
const Posted = styled.div`
  font-size: 15px;
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 5px;
`;
const ColumnWrapper = styled.div`
  display: flex;
`;
const Column = styled.div`
  display: flex;
  margin-left: 50px;
  margin-bottom: 12px;
  gap: 10px;
  cursor: pointer;
`;

const Photo = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover/contain;
  margin-left: 0px;
  border-radius: 8px;
  @media (max-width: 768px) {
    margin-right: 8px;
    width: 120px;
    height: 120px;
  }
`;
const Video = styled.video`
  display: flex;
  width: 180px;
  height: 120px;
  border-radius: 15px;
  object-fit: cover;
  @media (max-width: 768px) {
    margin-right: 8px;
    width: 120px;
    height: 120px;
  }
`;
const Icons = styled.div`
  display: flex;
  gap: 0px;
  justify-content: start;
  align-items: center;
  margin-left: 50px;
  margin-bottom: 0px;
  margin-top: 10px;
  cursor: pointer;
  color: #bababa;
`;

const IconWrapper = styled.div`
  width: 50px;
  height: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  &:nth-child(1) {
    margin-left: 0;
  }
  &:nth-child(2) {
    margin-left: 5px;
  }
  &:nth-child(3) {
    margin-left: 5px;
  }
  &:nth-child(4) {
    margin-left: 5px;
  }
`;

const ScrollWrapper = styled.div``;
const CommentsList = styled.div`
  width: 100%;
  height: auto;
`;

const CommentWrapper = styled.div`
  width: 100%;
  height: auto;
  background: ${(props) => props.theme.borderColor};
  padding: 15px;
  border-bottom: 1px solid ${(props) => props.theme.comentBouttomLine};
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-out;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 40px;
  @media (max-width: 768px) {
    margin-left: 14px;
  }
`;
const CommentUserImage = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
`;
const CommentUsername = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.fontcolor};
`;
const CommentTimer = styled.span`
  font-size: 10px;
  color: #9a9a9a;
  flex: 1;
`;

const DeletAll = styled.div`
  height: auto;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const DeletComment = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  width: 34px;
  height: 100%;
  border-radius: 50%;
  transition: all 0.2s;
  cursor: pointer;
  &:hover {
    opacity: 0.3;
  }
`;
const DeletIcon = styled.img`
  opacity: 0.6;
  width: 16px;
`;
const CometdescAll = styled.div`
  margin: 10px 0 0 8%;
  border-left: 2px solid ${(props) => props.theme.borderstroke};
  padding: 10px 0;
  @media (max-width: 768px) {
    margin: 10px 0 0 8%;
  }
`;
const CommentContent = styled.div`
  font-size: 14px;
  color: ${(props) => props.theme.fontcolor};
  margin-left: 30px;
`;
const CommentImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 10px;
  margin-left: 30px;
`;
const CommentVideo = styled.video`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 10px;
  margin-left: 30px;
`;
const NotComment = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin-top: 30px;
  font-size: 16px;
  color: #bababa;
`;

const PostComment = () => {
  const [post, setPost] = useState("");
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [dms, setDms] = useState(0);
  const [retweets, setRetweets] = useState(0);
  const [files, setFiles] = useState([]);
  const [postOwnerId, setPostOwnerId] = useState("");
  const { currentUser } = useAuth();
  const [profileImg, setProfileImg] = useState("");
  const [profileImages, setProfileImages] = useState({}); // 댓글
  const location = useLocation();
  const navigate = useNavigate();

  const {
    postId,
    userId,
    id,
    postContent,
    photos,
    videos,
    username,
    createdAt,
    likes: passedLikes,
    dms: passedDms,
    retweets: passedRetweets,
  } = location.state || {};

  useEffect(() => {
    const getUserProfileImage = async () => {
      try {
        const imgUrl = await fetchUserProfileImage(userId); // 프로필 이미지 가져오기
        setProfileImg(imgUrl || ""); // 이미지가 없으면 빈 값
      } catch (error) {}
    };

    // userId가 있을 때만 프로필 이미지 가져오기
    if (userId) {
      getUserProfileImage();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      setPostOwnerId(userId); // 포스트 작성자의 ID를 설정
    }
  }, [userId]);

  useEffect(() => {
    setLikes(passedLikes);
    setDms(passedDms);
    setRetweets(passedRetweets);
  }, [passedLikes, passedDms, passedRetweets]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (!location.state?.postId) return; // postId가 없으면 return
        const commentsRef = collection(
          db,
          "contents",
          location.state.postId,
          "comments"
        );
        const q = query(commentsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        // 댓글 데이터를 배열로 변환하여 상태에 저장
        const commentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setComments(commentsList); // 댓글 리스트 저장
        setCommentsCount(commentsList.length);
        const profileImagesMap = {};
        for (let comment of commentsList) {
          const profileImg = await fetchUserProfileImage(comment.userId);
          profileImagesMap[comment.userId] = profileImg || ""; // 프로필 이미지가 없으면 빈 문자열
        }
        setProfileImages(profileImagesMap);
      } catch (error) {}
    };

    fetchComments();
  }, [location.state?.postId]);

  const renderTimeAgo = () => {
    if (!createdAt || !createdAt.seconds) return "방금 전";
    const date = new Date(createdAt.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true, locale: ko });
  };

  const handleCommentClick = () => {
    navigate("/", {
      state: {
        postId: id,
        postContent: post,
        photos,
        videos,
        username,
        createdAt: createdAt || { seconds: Date.now() / 1000 },
        likes,
        dms,
        retweets,
        commentsCount,
      },
    });
  };

  useEffect(() => {
    const fetchPostOwner = async () => {
      try {
        if (!id) {
          return;
        }

        // Firestore에서 포스트 데이터를 가져와 userId 확인
        const postRef = doc(db, "contents", id);
        const postSnapshot = await getDoc(postRef);
        if (postSnapshot.exists()) {
          const postData = postSnapshot.data();

          if (postData.userId) {
            setPostOwnerId(postData.userId); // userId를 상태로 저장
          } else {
          }
        } else {
        }
      } catch (error) {}
    };

    fetchPostOwner(); // 포스트 작성자의 ID 가져오기
  }, [id]); // id가 변경될 때마다 실행

  const handleDeleteComment = async (commentId) => {
    try {
      const commentRef = doc(db, "contents", postId, "comments", commentId);
      await deleteDoc(commentRef); // Firebase에서 댓글 삭제
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      ); // UI에서 삭제된 댓글 제거
      setCommentsCount((prevCount) => prevCount - 1); // 댓글 수 감소
    } catch (error) {}
  };

  return (
    <div>
      <AllWrap>
        <Backarea>
          <BackBtn />
        </Backarea>
        <BoederWrapper>
          <PostWrapper>
            <Header>
              {profileImg ? (
                <UserImage src={profileImg} alt="User Profile"></UserImage>
              ) : (
                <UserIcon2 />
              )}
              <Username>{username}</Username>
              <Timer>{renderTimeAgo()}</Timer>
            </Header>
            <Column>
              <Posted>{postContent}</Posted>
            </Column>
            <ColumnWrapper>
              <Column>
                {photos &&
                  photos.length > 0 &&
                  photos.map((photoUrl, index) => (
                    <Photo
                      key={index}
                      src={photoUrl}
                      alt={`Post Image ${index + 1}`}
                    />
                  ))}
              </Column>
              <Column>
                {videos &&
                  videos.length > 0 &&
                  videos.map((videoUrl, index) => (
                    <Video key={index} controls autoPlay loop src={videoUrl} />
                  ))}
              </Column>
            </ColumnWrapper>
            <Icons>
              <IconWrapper>
                <HeartIcon width={20} /> {likes}
              </IconWrapper>
              <IconWrapper>
                <Coment width={20} /> {commentsCount}
              </IconWrapper>
              <IconWrapper>
                <RetweetIcon width={20} /> {retweets}
              </IconWrapper>
              <IconWrapper>
                <DmIcon width={18} /> {dms}
              </IconWrapper>
            </Icons>
          </PostWrapper>
          <div>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <ScrollWrapper>
                  <CommentsList>
                    <CommentWrapper key={comment.id}>
                      <CommentHeader>
                        <CommentUserImage
                          src={profileImages[comment.userId]}
                          alt="User Profile"
                        ></CommentUserImage>
                        <CommentUsername>{comment.username}</CommentUsername>
                        <CommentTimer>
                          {formatDistanceToNow(
                            new Date(comment.createdAt.seconds * 1000),
                            {
                              addSuffix: true,
                              locale: ko,
                            }
                          )}
                        </CommentTimer>
                        {currentUser?.uid === postOwnerId && (
                          <DeletAll>
                            <DeletComment
                              onClick={() => handleDeleteComment(comment.id)} // 댓글 삭제 클릭 시
                            >
                              <DeletIcon src="/x-circle.png" alt="circle" />
                            </DeletComment>
                          </DeletAll>
                        )}
                      </CommentHeader>
                      <CometdescAll>
                        <CommentContent>
                          {typeof comment.comment === "string"
                            ? comment.comment
                            : JSON.stringify(comment.comment)}
                        </CommentContent>

                        {/* 댓글에 이미지가 있을 경우 */}
                        {comment.photoUrls && comment.photoUrls.length > 0 && (
                          <div>
                            {comment.photoUrls.map((photoUrl, index) => (
                              <CommentImage
                                key={index}
                                src={photoUrl}
                                alt={`Comment Image ${index + 1}`}
                              />
                            ))}
                          </div>
                        )}

                        {/* 댓글에 비디오가 있을 경우 */}
                        {comment.videoUrls && comment.videoUrls.length > 0 && (
                          <div>
                            {comment.videoUrls.map((videoUrl, index) => (
                              <CommentVideo
                                key={index}
                                controls
                                autoPlay
                                loop
                                muted
                                src={videoUrl}
                              />
                            ))}
                          </div>
                        )}
                      </CometdescAll>
                    </CommentWrapper>
                  </CommentsList>
                </ScrollWrapper>
              ))
            ) : (
              <NotComment>댓글이 없습니다.</NotComment>
            )}
          </div>
        </BoederWrapper>
      </AllWrap>
    </div>
  );
};

export default PostComment;
