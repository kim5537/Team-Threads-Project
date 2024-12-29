// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Button from "../Common/Button";
import GlobalStyles from "../../styles/GlobalStyles.styles";
import Border from "../Common/Border_de";
import { useNavigate } from "react-router-dom";

import {
  CameraIcon,
  PictureIcon,
  MicIcon,
  HashtagIcon,
  RecoderIcon,
} from "../Common/Icon";
import Modal from "../Common/Modal";
import PostForm_Modal from "./PostForm_Modal";
import Loading from "../LoadingLogo/Loading";
import { useAuth } from "../../Contexts/AuthContext";

// Styled Components

const Wrapper = styled.div`
  width: 100%;
  height: calc(100vh - 120px);
`;
const BoederWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translate(-50%);
  margin: 0 auto;
  border-radius: 40px 40px 0 0;
  width: 680px;
  height: 85%;
  background: ${(props) => props.theme.borderWrapper};
  box-shadow: ${(props) => props.theme.bordershadow};
  @media (max-width: 768px) {
    position: fixed;
    border-radius: 0;
    width: 100%;
    height: calc(100% - 100px);
    bottom: 70px;
    box-shadow: none;
    border-radius: 0px 0px 0px 0px;
  }
`;

const Form = styled.form`
  position: absolute;
  left: 50%;
  height: 50%;
  bottom: 0;
  transform: translate(-50%);
  display: flex;
  flex-direction: column;
  width: 680px;
  height: 100%;
  gap: 10px;
  background: ${(props) => props.theme.borderColor};
  border-radius: 40px 40px 0 0;
  @media (max-width: 768px) {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 0 0 0 0;
  }
`;

const PlusImage = styled.div`
  display: flex;
  margin: 10px 20px;
  gap: 10px;
`;

const TextArea = styled.textarea`
  background: ${(props) => props.theme.borderColor};
  color: ${(props) => props.theme.fontcolor};
  border: none;
  padding: 20px;
  padding-left: 10px;
  font-size: 16px;
  margin: 0 auto;
  margin-top: 40px;
  width: 600px;
  height: 600px;
  resize: none;
  font-family: var(--pretendard-font);
  font-weight: 300;
  &::placeholder {
    color: #bababa;
    opacity: 1;
    font-size: 16px;
    transition: opacity 0.3s;
  }
  &:focus {
    &::placeholder {
      opacity: 0;
    }
    outline: none;
  }
  @media screen and (width: 390px) {
    border-radius: 0 0 0 0;
  }
`;

const Icons = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  margin-left: 20px;
  gap: 20px;
  @media (max-width: 768px) {
    margin: 0;
    margin-left: 20px;
  }
`;

const CameraButton = styled.label`
  cursor: pointer;
  fill: none;
`;
const CameraInput = styled.input`
  display: none;
`;

const PictureButton = styled.label`
  cursor: pointer;
`;
const PictureInput = styled.input`
  display: none;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 auto;
  gap: 20px;
  border-top: ${(props) => props.theme.borderstroke};
  padding: 20px;
  @media (max-width: 768px) {
    width: 100%;
    gap: 10px;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
`;
const OpenButton = styled.div`
  width: 300px;
  height: 80px;
  background: #d6d6d6;
  border: none;
  color: #000;
  font-size: 15px;
  text-align: center;
  line-height: 5.5;
  font-weight: bold;
  border-radius: 30px;
  transition: all 0.3s;
  &:hover {
    background: #eaeaea;
    color: #494949;
  }
  @media (max-width: 768px) {
    display: none;
  }
`;
const SubmitBtn = styled.input`
  width: 300px;
  height: 80px;
  background: #1c1c1c;
  color: #fff;
  font-size: 15px;
  font-weight: bold;
  border-radius: 30px;
  transition: all 0.3s;
  &:hover {
    background: #fff;
    color: #1c1c1c;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const IconBtn = styled.div`
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
`;

const PostForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState("");
  const [files, setFiles] = useState([]);
  const [opendForm, setOpenForm] = useState(false);
  const [selectedText, setSelectedText] = useState("팔로워에게만 허용");

  const [audioBlob, setAudioBlob] = useState(null); // 녹음 파일 상태
  const [isRecording, setIsRecording] = useState(false); // 녹음 중 상태
  const mediaRecorderRef = useRef(null); // MediaRecorder 참조
  const [audioURL, setAudioURL] = useState(null); // 녹음 파일 미리보기 URL 상태

  const { currentUser } = useAuth(); // 현재 사용자 상태를 가져옴
  const navigate = useNavigate();

  const generateCustomId = () => {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 1000000).toString();
    return timestamp + randomNum; // 두 값을 조합하여 고유 식별자 생성
  };

  useEffect(() => {
    if (!currentUser) {
      const confirmLogin = window.confirm("로그인 하시겠습니까?");
      if (confirmLogin) {
        navigate("/login"); // "예"를 누르면 로그인 페이지로 이동
      } else {
        navigate("/");
      }
    }
  }, [currentUser, navigate]);

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const maxFilesCount = 3;

  const handlePostChange = (e) => {
    setPost(e.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).filter((file) => {
        if (file.size > maxFileSize) {
          alert("업로드 가능한 파일의 최대 크기는 5MB입니다.");
          return false;
        }
        return true;
      });

      if (files.length + newFiles.length > maxFilesCount) {
        alert(`파일은 최대 ${maxFilesCount}장까지만 업로드할 수 있습니다.`);
        return;
      }

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // 녹음 시작
  const startRecording = () => {
    // 기존 녹음 파일 초기화
    setAudioBlob(null); // 이전 녹음 파일 제거
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.type !== "audio/mp3")
    ); // 기존 오디오 파일 삭제

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      let chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/mp3" });
        setAudioBlob(audioBlob); // 녹음이 끝나면 audioBlob 상태 설정

        const audioFile = new File([audioBlob], "recording.mp3", {
          type: "audio/mp3",
        });

        // 녹음 파일을 files 배열에 추가
        setFiles((prevFiles) => [...prevFiles, audioFile]);

        chunks = []; // 녹음 후 chunks 초기화
      };
    });
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || post === "" || post.length > 180) return;

    // 랜덤으로 아이콘 값 생성
    const randomLikes = Math.floor(Math.random() * 100);
    const randomComments = Math.floor(Math.random() * 10);
    const randomDms = Math.floor(Math.random() * 50);
    const randomRetweets = Math.floor(Math.random() * 5);

    try {
      setIsLoading(true);

      // 커스텀 고유 ID 생성
      const customPostId = generateCustomId(); // 고유 식별자 생성

      // Firebase에 포스트 기본 정보 저장
      const docRef = await addDoc(collection(db, "contents"), {
        post,
        createdAt: serverTimestamp(),
        username: user?.displayName || "Anonymous",
        userId: user.uid,
        email: user.email,
        customPostId,
        likes: randomLikes,
        comments: randomComments,
        dms: randomDms,
        retweets: randomRetweets, // 랜덤 아이콘 값 저장
      });

      const photoUrls = [];
      const videoUrls = [];

      // 파일이 있을 경우 업로드
      await Promise.all(
        files.map(async (file) => {
          const locationRef = ref(
            storage,
            `contents/${user.uid}/${docRef.id}/${file.name}`
          );
          const result = await uploadBytes(locationRef, file);
          const url = await getDownloadURL(result.ref);

          if (file.type.startsWith("image/")) {
            photoUrls.push(url);
          } else if (file.type.startsWith("video/")) {
            videoUrls.push(url);
          }
        })
      );

      // 녹음 파일 업로드
      if (audioBlob) {
        const audioRef = ref(
          storage,
          `contents/${user.uid}/${docRef.id}/recording.mp3`
        );
        await uploadBytes(audioRef, audioBlob);
        const audioURL = await getDownloadURL(audioRef);
        await updateDoc(docRef, { audioURL });
      }

      await updateDoc(docRef, {
        photos: photoUrls,
        videos: videoUrls,
      });

      // 제출 후 상태 초기화
      setPost("");
      setFiles([]);
      setAudioBlob(null);
      navigate("/");
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const openFormModal = () => {
    setOpenForm(true);
  };
  const closeFormModal = () => {
    setOpenForm(false);
  };
  const handleSelect = (text) => {
    setSelectedText(text);
  };
  return (
    <Wrapper>
      <BoederWrapper>
        <Form onSubmit={handleSubmit}>
          {isLoading ? <Loading /> : null}
          <TextArea
            onChange={handlePostChange}
            value={post}
            name="contents"
            id="contents"
            placeholder="내용을 작성하세요.."
            required
          />
          <PlusImage>
            {files.map((file, index) => (
              <div key={index} style={{ position: "relative", margin: "5px" }}>
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Uploaded Preview ${index + 1}`}
                    style={{
                      width: "160px",
                      height: "160px",
                      borderRadius: "10px",
                      objectFit: "cover",
                    }}
                  />
                ) : file.type.startsWith("video/") ? (
                  <video
                    controls
                    style={{
                      width: "160px",
                      height: "160px",
                      borderRadius: "10px",
                      objectFit: "cover",
                    }}
                  >
                    <source src={URL.createObjectURL(file)} />
                  </video>
                ) : (
                  <audio
                    controls
                    src={URL.createObjectURL(file)}
                    style={{
                      width: "140px", // 오디오 컨트롤러의 너비를 이미지/비디오와 맞춤
                      height: "40px", // 오디오 컨트롤러의 높이 설정
                      borderRadius: "10px", // 일관성을 위해 오디오에도 경계 반경 적용
                      objectFit: "contain",
                    }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                )}
                <DeleteButton onClick={() => removeFile(index)}>X</DeleteButton>
              </div>
            ))}
          </PlusImage>
          <Icons>
            <CameraButton htmlFor="camera">
              <CameraIcon width={36} />
              <CameraInput
                onChange={handleFileChange}
                id="camera"
                type="file"
                accept="video/*, image/*"
              />
            </CameraButton>
            <PictureButton htmlFor="picture">
              <PictureIcon width={24} />
              <PictureInput
                onChange={handleFileChange}
                id="picture"
                type="file"
                accept="video/*, image/*"
              />
            </PictureButton>
            {/* 녹음 기능 */}

            {!isRecording ? (
              <IconBtn onClick={startRecording}>
                <MicIcon width={24} />
              </IconBtn>
            ) : (
              <IconBtn onClick={stopRecording}>
                <RecoderIcon width={24} />
              </IconBtn>
            )}
            <HashtagIcon width={24} />
          </Icons>
          <Buttons>
            <OpenButton onClick={openFormModal}>{selectedText}</OpenButton>
            <SubmitBtn
              text="스레드 업로드"
              type="submit"
              value={isLoading ? "Posㅋting..." : "Post"}
            />
          </Buttons>
        </Form>
      </BoederWrapper>
      {opendForm && (
        <PostForm_Modal onClose={closeFormModal} onSelect={handleSelect} />
      )}
    </Wrapper>
  );
};

export default PostForm;
