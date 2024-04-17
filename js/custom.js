// UI Control

// header 높이
const headerHeight = document.querySelector('header').scrollHeight;
const bottomHeight = document.querySelector('.bottom-bar').scrollHeight;
const details = document.querySelector('.details'); // details 요소 저장
const section = document.querySelector('section .container');
// section.map-wrapper 요소 지정
section.style.height = `calc(100vh - ${headerHeight}px)`; //100vh - header 높이 빼기
details.style.bottom = `calc(${bottomHeight}px + 15px)`; // 버튼 높이 조정
//도서관 api 데이터 가공 2022년 이후 데이터 중 위도가 주어지는 데이터만 남기는 것으로 필터링
const lib_data = data.records;
const current = lib_data.filter((item) => {
  return item.데이터기준일자.split('-')[0] >= '2022' && item.위도 !== '';
});
//&& 양쪽 변이 모두 참이어야 참
// || 양쪽 변 중 하나만 참이어도 참

// 24.04.03 input click event부터 끝까지 모두 나중에 쓸겁니다.

// console.log(current[0]);

// input click event
const input = document.querySelector('.search-bar input'); // input 요소 저장
const btn = document.querySelector('.search-bar button'); // button 요소 저장
const loading = document.querySelector('.loading'); // loading 요소 저장
const mapElmt = document.querySelector('#map'); // map 요소 저장

// 1. 처음 로딩 시 'on' class를 추가해준다.
loading.classList.add('on'); // 로딩 gif를 불러오는데, 여기서는 처음 홈페이지가 뜰 때 나타나게 하는 명령어이다.

btn.addEventListener('click', function () {
  const detailsWrapper = document.querySelector('.details');
  detailsWrapper.style.display = 'none'; // 초기 활성화 시 모든 details 요소 숨김
  const value = input.value; //위의 input에 작성된 글을 value로 읽게 함.
  if (value === '') {
    alert('검색어를 입력해 주세요.');
    input.focus();
    return;
  }

  mapElmt.innerHTML = ''; // 초기 활성화 시 모든 map 자식 요소 삭제
  const searchResult = current.filter((item) => {
    return item.도서관명.includes(value) || item.시군구명.includes(value); // 도서관명 or 시군구명 중 하나를 value값에 넣어서 true / false로 판단한 후 return하라는 형태 || << 둘 중에 하나라도 true면 true로 처리하라는 말
  });

  console.log(searchResult);
  // 2. 버튼 클릭 시에도 on class를 추가해준다.
  loading.classList.add('on');

  startLenderLocation(searchResult[0].위도, searchResult[0].경도); // 함수의 대입값이 '현재위치'에서 '위도, 경도'로 바뀌었음.
}); // button 클릭 시 실행할 함수

input.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    // 이미 input을 위에서 const를 통해 정의해놨으므로 그대로 사용할 수 있음.
    btn.click();
    // 엔터키 치면 검색이 실행되게 하는 명령어
  }
});

// ==============
// NAVER MAP API CODES
// ==============

navigator.geolocation.getCurrentPosition((position) => {
  //현재 유저의 위치 파악하는 곳
  let lat = position.coords.latitude;
  let lng = position.coords.longitude;

  startLenderLocation(lat, lng); // 새 함수의 실행 - 정의가 필요
}); // 현재 사용자 위치의 위도 및 경도 값 추출

// 위 함수의 정의
function startLenderLocation(la, ln) {
  var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(la, ln),
    zoom: 14,
  });

  var marker = new naver.maps.Marker({
    position: new naver.maps.LatLng(la, ln),
    map: map, // 지도에 마커 추가
  });

  current.forEach((item) => {
    // console.log(item.위도, item.경도);
    let latLng = new naver.maps.LatLng(item.위도, item.경도);

    //화면 범위 내의 도서관만 마커로 표시 (안그럼 컴퓨터가 버티질 못해요~)
    let bounds = map.getBounds();

    if (bounds.hasLatLng(latLng)) {
      let marker = new naver.maps.Marker({
        position: latLng,
        map: map, // latLng과 marker 변수의 정의
      });

      // 마커 위에 정보 인쇄하기
      let infoWindow = new naver.maps.InfoWindow({
        content: `
      <h4 style="padding:0.25rem; font-size:14px; font-weight:normal; color:#fff; background:#222; border-radius:20px;">${item.도서관명}</h4>
      `,
        // 백틱은 문자열 안에 변수를 넣을 때 사용한다.
      });
      naver.maps.Event.addListener(marker, 'click', function () {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }

        const markerInfoData = {
          title: item.도서관명, // title에 data셋 내 '도서관명' 인식
          itemCount: item['자료수(도서)'],
          serialItemCount: item['자료수(연속간행물)'],
          notBookItemCount: item['자료수(비도서)'],
          sitCount: item.열람좌석수,
          wdStart: item.평일운영시작시각,
          wdEnd: item.평일운영종료시각,
          wkStart: item.토요일운영시작시각,
          wkEnd: item.토요일운영종료시각,
          contact: item.도서관전화번호,
          address: item.소재지도로명주소,
          homePage: item.홈페이지주소,
        };

        getInfoOnMarker(markerInfoData);
        const h4 = document.querySelector('h4');
        const tri = h4.parentNode;
        const tri2 = tri.parentNode;
        tri2.style.background = rgb(0, 0, 0);
      });
    }
  }); // end of current forEach method

  // 3. 모든 클래스가 완료되면 gif를 제거.
  loading.classList.remove('on'); // 여기서의 명령어는 로딩 gif가 맵이 다 불러지면 없어지게 하는 명령어이다.
  // 여기서 정의했으므로 그 위에서 실행한 함수는 lat, lng 값을 불러온다.
}

function getInfoOnMarker(data) {
  // console.log(data);
  const detailsWrapper = document.querySelector('.details');
  detailsWrapper.style.display = 'none'; // 초기 활성화 시 모든 details 요소 숨김
  detailsWrapper.innerHTML = ''; // 초기 활성화 시 모든 details 요소 삭제

  const infoElmt =
    // 도서관 이름 등 필요한 정보 부분에 ${} 형태로 변수 넣기 - 이 변수를 넣기 위해 백틱을 사용해야 한다 !
    `<div class="title">
  <h2>${data.title}</h2>
  <i class="ri-close-circle-fill"></i>
</div>
<div class="info">
  <!-- 중요 정보 -->
  <div class="boxinfo">
    <div class="red1">
      <h3>도서</h3>
      <h3>${data.itemCount}</h3>
    </div>
    <div class="red2">
      <h3>연속간행물</h3>
      <h3>${data.serialItemCount}</h3>
    </div>
    <div class="red3">
      <h3>비도서</h3>
      <h3>${data.notBookItemCount}</h3>
    </div>
    <div class="blue">
      <h3>열람좌석수</h3>
      <h3>${data.sitCount}</h3>
    </div>
  </div>
  <!-- 기본 정보 -->
  <div class="letterinfo">
    <div class="time"><br>
      <div class="info-title">운영시간 :</div>
      <div class="info-contents">
        <p class="weekday">${data.wdStart} ~ ${data.wdEnd} (평일)</p>
        <p class="weekend">${data.wkStart} ~ ${data.wkEnd} (토요일 및 공휴일)</p>
        <p class="msg">* 공휴일 휴관</p>
      </div>
    </div><br>
    <div class="call">
      <div class="info-title">연락처 :</div>
      <div class="info-contents">
        <p class="call_each">${data.contact}</p>
      </div>
    </div><br>
    <div class="address">
      <div class="info-title">주소 :</div>
      <div class="info-contents">
        <p class="address_each">${data.address}</p>
      </div>
    </div>
  </div>
  <div class="link">
  <!-- 홈페이지로 이동 -->
    <a href="${data.homePage}" class="#">홈페이지로 연결</a>
  </div>
  `;

  detailsWrapper.insertAdjacentHTML('beforeend', infoElmt);
  detailsWrapper.style.display = 'block';
}

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('ri-close-circle-fill')) {
    //내가 선택 (e.target)한 대상에 저런 classList가 있다면~
    const detailsWrapper = document.querySelector('.details');
    detailsWrapper.style.display = 'none';
  }
});
