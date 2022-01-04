(() => {
  let yOffset = 0; //window.pageYOffset 대신 쓸 변수
  let prevScrollHeight = 0; //현재 스크롤 위치 보다 이전에 위치한 스크롤 섹션들 높이값의 합
  let currentScene = 0; //현재 활성화 된 (눈 앞에 보고 있는) 씬 (scroll-section)
  let enterNewScene = false; //새로운 Scene이 시작되는 순간 true가 되게 하고 싶은 변수
  let acc = 0.1; // 가속도
  let delayedYOffset = 0;
  let rafId;
  let rafState;

  // Scene 정보 객체
  const sceneInfo = [
    // currentScene = 0
    {
      // 타입에 따라 스크롤 영역을 다르게 만들어 줄 예정
      type: "sticky",
      heightNum: 15,
      //브라우저 높이에 heightNub 변수를 곱해 scrollHeight 세팅할 예정(스크롤 영역을 길게 만들어야 하므로)
      scrollHeight: 0,
      objs: {
        container: document.querySelector("#scroll-section-0"),
        messageA: document.querySelector("#scroll-section-0 .main-message.a"),
        messageB: document.querySelector("#scroll-section-0 .main-message.b"),
        messageC: document.querySelector("#scroll-section-0 .main-message.c"),
        canvas: document.querySelector("#video-canvas-0"),
        context: document.querySelector("#video-canvas-0").getContext("2d"),
        videoImages: [],
      },
      values: {
        videoImageCount: 694,
        imageSequence: [0, 693],
        canvas_opacity: [1, 0, { start: 0.95, end: 1 }],
        messageA_opacity_in: [0, 1, { start: 0.08, end: 0.13 }],
        messageA_opacity_out: [1, 0, { start: 0.18, end: 0.23 }],
        messageA_translateY_in: [20, 0, { start: 0.08, end: 0.13 }],
        messageA_translateY_out: [0, -20, { start: 0.18, end: 0.23 }],

        messageB_opacity_in: [0, 1, { start: 0.2, end: 0.25 }],
        messageB_opacity_out: [1, 0, { start: 0.3, end: 0.35 }],
        messageB_translateY_in: [20, 0, { start: 0.2, end: 0.25 }],
        messageB_translateY_out: [0, -20, { start: 0.3, end: 0.35 }],

        messageC_opacity_in: [0, 1, { start: 0.4, end: 0.45 }],
        messageC_opacity_out: [1, 0, { start: 0.5, end: 0.55 }],
        messageC_translateY_in: [20, 0, { start: 0.4, end: 0.45 }],
        messageC_translateY_out: [0, -20, { start: 0.5, end: 0.55 }],
      },
    },
    // currentScene = 1
    {
      type: "normal",
      // heightNum: 5, normal 타입에서는 스크롤 영역을 늘릴 필요가 없음
      scrollHeight: 0,
      objs: {
        container: document.querySelector("#scroll-section-1"),
      },
    },
    // currentScene = 2
    {
      type: "sticky",
      heightNum: 10,
      scrollHeight: 0,
      objs: {
        container: document.querySelector("#scroll-section-2"),
        messageA: document.querySelector("#scroll-section-2 .a"),
        canvas: document.querySelector("#video-canvas-1"),
        context: document.querySelector("#video-canvas-1").getContext("2d"),
        videoImages: [],
      },
      values: {
        videoImageCount: 597,
        imageSequence: [0, 596],
        canvas_opacity_in: [0, 1, { start: 0, end: 0.1 }],
        canvas_opacity_out: [1, 0, { start: 0.9, end: 1 }],
        messageA_opacity_in: [0, 1, { start: 0.25, end: 0.3 }],
        messageA_opacity_out: [1, 0, { start: 0.4, end: 0.45 }],
        messageA_translateY_in: [20, 0, { start: 0.15, end: 0.2 }],
        messageA_translateY_out: [0, -20, { start: 0.4, end: 0.45 }],
      },
    },
    // currentScene = 3
    {
      type: "sticky",
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector("#scroll-section-3"),
        canvasCaption: document.querySelector(".canvas-caption"),
        canvas: document.querySelector(".image-blend-canvas"),
        context: document.querySelector(".image-blend-canvas").getContext("2d"),
        imagePath: ["./images/blend-image-1.jpg", "./images/blend-image-2.jpg"],
        images: [],
      },
      values: {
        rect1X: [0, 0, { start: 0, end: 0 }],
        rect2X: [0, 0, { start: 0, end: 0 }],
        blendHeight: [0, 0, { start: 0, end: 0 }],
        canvas_scale: [0, 0, { start: 0, end: 0 }],
        canvasCaption_opacity: [0, 1, { start: 0, end: 0 }],
        canvasCaption_translateY: [50, 0, { start: 0, end: 0 }],
        rectStartY: 0,
      },
    },
  ];

  // 수 많은 이미지를 각 데이터 배열에 넣는 함수
  function setCanvasImage() {
    let imgElem;
    for (let i = 0; i < sceneInfo[0].values.videoImageCount; i++) {
      imgElem = new Image();
      imgElem.src = `./video/001/scene (${1 + i}).JPG`;
      sceneInfo[0].objs.videoImages.push(imgElem);
    }

    let imgElem2;
    for (let i = 0; i < sceneInfo[2].values.videoImageCount; i++) {
      imgElem2 = new Image();
      imgElem2.src = `./video/002/scene (${1 + i}).JPG`;
      sceneInfo[2].objs.videoImages.push(imgElem2);
    }

    let imgElem3;
    for (let i = 0; i < sceneInfo[3].objs.imagePath.length; i++) {
      imgElem3 = new Image();
      imgElem3.src = sceneInfo[3].objs.imagePath[i];
      sceneInfo[3].objs.images.push(imgElem3);
    }
  }

  // 스크롤시 header 표현 함수
  function checkMenu() {
    // 아래의 yOffset 변수는 윈도우에 스크롤 이벤트핸들러에 선언
    if (yOffset > 44) {
      document.body.classList.add("local-sticky-nav");
    } else {
      document.body.classList.remove("local-sticky-nav");
    }
  }

  // 레이아웃 세팅
  function setLayout() {
    // 각 스크롤 높이 세팅
    for (let i = 0; i < sceneInfo.length; i++) {
      if (sceneInfo[i].type === "sticky") {
        sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
      } else if (sceneInfo[i].type === "normal") {
        sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
      }
      sceneInfo[
        i
      ].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
    }

    yOffset = window.pageYOffset;

    // 새로고침 됐을 때에도 currentScene 값 유지하기
    // 현재의 currentScene을 판단하기 위해서 현재 y축 위치값이 그 지점 까지 scene들의 높이 합 이하일 때 해당 인덱스를 currnetScene에 부여하는 로직
    let totalScrollHeight = 0;
    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;
      if (totalScrollHeight >= yOffset) {
        currentScene = i;
        break;
      }
    }

    // 현재 scene에 맞는 내용만 보이기 위해 body에 id값 할당
    document.body.setAttribute("id", `show-scene-${currentScene}`);

    // 현재 창 크기에 맞게 캔버스 크기를 조절하기 위해서, 창의 가로 길이 중 더 긴 것에 맞춰질 수 있도록 비율 구해 scale 적용
    if (window.innerWidth <= window.innerHeight) {
      const canvasHeightRatio = window.innerHeight / 1080;
      sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${canvasHeightRatio})`;
      sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${canvasHeightRatio})`;
      console.log(`canvas의 기준점 innerHeight으로 결정`);
    } else {
      const canvasWidthRatio = window.innerWidth / 1920;
      sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${canvasWidthRatio})`;
      sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${canvasWidthRatio})`;
      console.log(`canvas의 기준점 innerWidth으로 결정`);
    }
  }

  // CSS 속성 값을 y축 범위 비율에 맞게 변경하는 함수
  function calcValues(values, currentYOffset) {
    // 현재 scene의 총 height 값에 비례한 현재 y축 위치의 비율 구하기
    let rv;
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;

    // values의 프로퍼티가 3의 길이를 가진 배열이라면 즉, CSS 첫 값, 끝 값, start~end 지점을 가지는 배열을 가진 프로퍼티 일 때 실행되는 함수
    if (values.length === 3) {
      // 2번 인덱스에 담아둔 start~end 비율 범위에 총 height를 곱해 실질적인 값을 가진 범위로 변경
      // 하나의 요소가 표현되는 start~end 지점 이므로 part라는 이름을 변수에 붙인 것
      const partScrollStart = values[2].start * scrollHeight;
      const partScrollEnd = values[2].end * scrollHeight;
      const partScrollHeight = partScrollEnd - partScrollStart;

      // 실질적인 값을 가진 범위를 구했으니 이를 이용해 CSS 값의 범위로 바꿔주기
      // 현재 위치가 해당 범위 안에 있을 경우
      if (
        currentYOffset >= partScrollStart &&
        currentYOffset <= partScrollEnd
      ) {
        // 요소의 CSS가 시작되는 지점 부터 현재 위치 까지의 거리 비율을 CSS 값 범위에 곱한다.
        // CSS범위를 구해줬으므로 CSS 시작 점의 값을 더해주면 현재 위치에서 가지는 CSS의 실질적인 값을 구할 수 있다. 여기서는 rv값
        rv =
          ((currentYOffset - partScrollStart) / partScrollHeight) *
            (values[1] - values[0]) +
          values[0];
      } else if (currentYOffset <= partScrollStart) {
        rv = values[0];
      } else if (currentYOffset >= partScrollEnd) {
        rv = values[1];
      }
    } else {
      rv = scrollRatio * (values[1] - values[0]) + values[0];
    }
    return rv;
  }

  // 위에서 구한 값을 바탕으로한 스크롤 이벤트핸들러
  function playAnimation() {
    const objs = sceneInfo[currentScene].objs;
    const values = sceneInfo[currentScene].values;
    const currentYOffset = yOffset - prevScrollHeight;
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;

    switch (currentScene) {
      case 0:
        // 캔버스에 비디오 이미지를 그려주는 아래 코드는 감속을 적용시키기 위해 loop함수로 이동하여 적용
        // let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
        // objs.context.drawImage(objs.videoImages[sequence], 0, 0);

        objs.canvas.style.opacity = calcValues(
          values.canvas_opacity,
          currentYOffset
        );

        if (scrollRatio <= 0.15) {
          // in
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_in,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_out,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        if (scrollRatio <= 0.27) {
          // in
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_in,
            currentYOffset
          );
          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_out,
            currentYOffset
          );
          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        if (scrollRatio <= 0.47) {
          // in
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_in,
            currentYOffset
          );
          objs.messageC.style.transform = `translate3d(0, ${calcValues(
            values.messageC_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_out,
            currentYOffset
          );
          objs.messageC.style.transform = `translate3d(0, ${calcValues(
            values.messageC_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        break;

      case 2:
        if (scrollRatio <= 0.5) {
          objs.canvas.style.opacity = calcValues(
            values.canvas_opacity_in,
            currentYOffset
          );
        } else {
          objs.canvas.style.opacity = calcValues(
            values.canvas_opacity_out,
            currentYOffset
          );
        }

        if (scrollRatio <= 0.32) {
          // in
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_in,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_out,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        // 화면의 자연스러운 연결을 위해 currentScene 3 에서 쓰는 캔버스 이미지 미리 그리기
        if (scrollRatio > 0.9) {
          const objs = sceneInfo[3].objs;
          const values = sceneInfo[3].values;
          const widthRatio = window.innerWidth / objs.canvas.width;
          const heightRatio = window.innerHeight / objs.canvas.height;
          let canvasScaleRatio;

          if (widthRatio <= heightRatio) {
            canvasScaleRatio = heightRatio;
          } else {
            canvasScaleRatio = widthRatio;
          }

          objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
          objs.context.fillStyle = "#fff";
          objs.context.drawImage(objs.images[0], 0, 0);

          // 캔버스에 맞춰 가정한 innerWidth와 innerHeight
          // 좌우 흰색 박스의 크기를 지정해주기 위해서는 캔버스에 곱해진 scale 을 다시 적용 전으로 돌리는 width와 height 값이 필요하다.
          const recalculatedInnerWidth =
            window.document.body.offsetWidth / canvasScaleRatio;
          // const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio; // 오류가 있어서 사용X
          const recalculatedInnerHeight = window.innerHeight / heightRatio;
          const whiteRectWidth = recalculatedInnerWidth * 0.15;
          values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
          values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
          values.rect2X[0] =
            values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
          values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

          // 좌우 흰색 박스 그리기
          objs.context.fillRect(
            parseInt(values.rect1X[0]),
            0,
            parseInt(whiteRectWidth),
            recalculatedInnerHeight
          );
          objs.context.fillRect(
            parseInt(values.rect2X[0]),
            0,
            parseInt(whiteRectWidth),
            recalculatedInnerHeight
          );
        }

        break;

      case 3:
        // console.log('3 play');
        const widthRatio = window.innerWidth / objs.canvas.width;
        const heightRatio = window.innerHeight / objs.canvas.height;
        let canvasScaleRatio;
        let step = 0;

        if (widthRatio <= heightRatio) {
          canvasScaleRatio = heightRatio;
          console.log(`heightRatio를 기준으로 결정`);
        } else {
          canvasScaleRatio = widthRatio;
          console.log(`widthRatio를 기준으로 결정`);
        }

        objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
        objs.context.fillStyle = "#fff";
        objs.context.drawImage(objs.images[0], 0, 0);

        // 캔버스에 맞춰 가정한 innerWidth와 innerHeight
        // 스크롤 바를 제외하고 계산하기 위해 body.offsetWidth 사용
        const recalculatedInnerWidth =
          window.document.body.offsetWidth / canvasScaleRatio;
        // const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio; // 오류가 있어서 사용X
        const recalculatedInnerHeight = window.innerHeight / heightRatio;

        if (!values.rectStartY) {
          // values.rectStartY = objs.canvas.getBoundingClientRect().top;
          values.rectStartY =
            objs.canvas.offsetTop +
            (objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2;
          values.rect1X[2].start = window.innerHeight / 2 / scrollHeight;
          values.rect2X[2].start = window.innerHeight / 2 / scrollHeight;
          values.rect1X[2].end = values.rectStartY / scrollHeight;
          values.rect2X[2].end = values.rectStartY / scrollHeight;
        }

        const whiteRectWidth = recalculatedInnerWidth * 0.15;
        values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
        values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
        values.rect2X[0] =
          values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
        values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

        // 좌우 흰색 박스 그리기
        objs.context.fillRect(
          parseInt(calcValues(values.rect1X, currentYOffset)),
          0,
          parseInt(whiteRectWidth),
          recalculatedInnerHeight
        );
        objs.context.fillRect(
          parseInt(calcValues(values.rect2X, currentYOffset)),
          0,
          parseInt(whiteRectWidth),
          recalculatedInnerHeight
        );

        // 위에서 그린 캔버스 이미지가 화면상단에 닿기 전과 닿은 후로 나눠서 구분
        if (scrollRatio < values.rect1X[2].end) {
          step = 1;
          objs.canvas.classList.remove("sticky");
        } else {
          step = 2;
          values.blendHeight[0] = 0;
          values.blendHeight[1] = objs.canvas.height;
          values.blendHeight[2].start = values.rect2X[2].end;
          values.blendHeight[2].end = values.rect2X[2].end + 0.2;
          const blendHeight = calcValues(values.blendHeight, currentYOffset);

          objs.context.drawImage(
            objs.images[1],
            0,
            objs.canvas.height - blendHeight,
            objs.canvas.width,
            blendHeight,
            0,
            objs.canvas.height - blendHeight,
            objs.canvas.width,
            blendHeight
          );

          objs.canvas.classList.add("sticky");
          objs.canvas.style.top = `${
            -(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2
          }px`;

          if (scrollRatio > values.blendHeight[2].end) {
            values.canvas_scale[0] = canvasScaleRatio;
            values.canvas_scale[1] =
              document.body.offsetWidth / (2 * objs.canvas.width);
            values.canvas_scale[2].start = values.blendHeight[2].end;
            values.canvas_scale[2].end = values.blendHeight[2].end + 0.2;

            objs.canvas.style.transform = `scale(${calcValues(
              values.canvas_scale,
              currentYOffset
            )})`;
            objs.canvas.style.marginTop = 0;
          }

          if (
            scrollRatio > values.canvas_scale[2].end &&
            values.canvas_scale[2].end > 0
          ) {
            objs.canvas.classList.remove("sticky");
            objs.canvas.style.marginTop = `${scrollHeight * 0.4}px`;

            values.canvasCaption_opacity[2].start = values.canvas_scale[2].end;
            values.canvasCaption_opacity[2].end =
              values.canvas_scale[2].end + 0.1;
            values.canvasCaption_translateY[2].start =
              values.canvas_scale[2].end;
            values.canvasCaption_translateY[2].end =
              values.canvas_scale[2].end + 0.1;
            objs.canvasCaption.style.opacity = calcValues(
              values.canvasCaption_opacity,
              currentYOffset
            );
            objs.canvasCaption.style.transform = `translate3d(0, ${calcValues(
              values.canvasCaption_translateY,
              currentYOffset
            )}%, 0)`;
          }
        }
        break;
    }
  }

  // 스크롤 이벤트핸들러
  function scrollLoop() {
    prevScrollHeight = 0;
    enterNewScene = false;

    for (let i = 0; i < currentScene; i++) {
      prevScrollHeight += sceneInfo[i].scrollHeight;
    }

    if (
      delayedYOffset <
      prevScrollHeight + sceneInfo[currentScene].scrollHeight
    ) {
      document.body.classList.remove("scroll-effect-end");
    }

    if (
      delayedYOffset >
      prevScrollHeight + sceneInfo[currentScene].scrollHeight
    ) {
      enterNewScene = true;

      // currentScene이 3일 때 display:none적용을 위한 클래스 추가
      if (currentScene === sceneInfo.length - 1) {
        document.body.classList.add("scroll-effect-end");
      }
      // currentScene이 3보다 작을 때만 ++ 적용
      if (currentScene < sceneInfo.length - 1) {
        currentScene++;
      }
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    }

    if (delayedYOffset < prevScrollHeight) {
      if (currentScene === 0) return; //브라우저 바운스 효과로 인해 마이너스 값이 되는 것을 방지 (모바일)
      enterNewScene = true;
      currentScene--;
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    }
    // Scene이 바뀌는 순간에는 함수 playAnimation을 실행시키지 않고 즉시 종료. (음수 값이 나오는 오류를 방지 하기 위해서)
    if (enterNewScene) return;

    playAnimation();
  }

  // 이미지를 동영상 배경처럼 보이게 하는 함수
  function loop() {
    delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;
    const currentYOffset = delayedYOffset - prevScrollHeight;
    const values = sceneInfo[currentScene].values;
    const objs = sceneInfo[currentScene].objs;

    if (!enterNewScene) {
      if (currentScene === 0 || currentScene === 2) {
        let sequence = Math.round(
          calcValues(values.imageSequence, currentYOffset)
        );
        if (objs.videoImages[sequence]) {
          objs.context.drawImage(objs.videoImages[sequence], 0, 0);
        }
      }
    }

    // requestAnimationFram() 안에 함수를 재귀적으로 실행
    rafId = requestAnimationFrame(loop);

    // 목표지점과 현재 지점의 차이(절대값)가 1px 미만일 때 loop 함수 중지
    if (Math.abs(yOffset - delayedYOffset) < 1) {
      cancelAnimationFrame(rafId);
      rafState = false;
    }
  }

  // 새로고침 이벤트
  window.addEventListener("load", () => {
    document.body.classList.remove("before-load");

    setLayout();

    sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0);

    let templeYOffset = yOffset;
    let templeScrollCount = 0;

    // 새로고침시 자동으로 스크롤이 조금 움직이게 하여 스크롤 이벤트핸들러 실행시키기
    if (yOffset > 0) {
      let siId = setInterval(() => {
        window.scrollTo(0, templeYOffset);
        templeYOffset += 5;
        templeScrollCount++;
        if (templeScrollCount > 20) {
          clearInterval(siId);
        }
      }, 20);
    }

    // 스크롤 이벤트
    window.addEventListener("scroll", () => {
      yOffset = window.pageYOffset;
      scrollLoop();
      checkMenu();

      // rafState의 상태가 falsy한 상태에서 스크롤이 발생할 경우 loop 실행
      if (!rafState) {
        rafId = requestAnimationFrame(loop);
        rafState = true;
      }
    });

    // 리사이즈 이벤트
    window.addEventListener("resize", () => {
      // 모바일 환경을 제외하고, 리사이즈 이벤트가 발생할 때  setLayout 재설정
      if (window.innerWidth > 900) {
        window.location.reload();
      }
    });

    // 모바일 가로세로 변경시 resize가 아니라 transitionend가 발생하는 경우 대비
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });

    // 로딩 이미지를 부여하는 클래스가 트랜지션이 끝난 다음에 삭제될 수 있도록 처리
    document
      .querySelector(".loading")
      .addEventListener("transitionend", (e) => {
        document.body.removeChild(e.currentTarget);
      });
  });

  setCanvasImage();
})();
