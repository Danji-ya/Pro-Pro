import Component from '../../components/component';
import './detailPage.scss';
import viewIcon from '../../assets/icons/view.svg';
import javascriptLogo from '../../assets/icons/javascript.svg';

import Stacks from '../../components/Stacks/Stacks';
import Comments from '../../components/Comments/Comments';
import CommentForm from '../../components/CommentForm/CommentForm';
import PostBanner from '../../components/PostBanner/PostBanner';
import EditButtons from '../../components/EditButtons/EditButtons';

import RouterContext from '../../router/RouterContext';
import axiosInstance from '../../utils/api';
import Bookmark from '../../components/Bookmark/Bookmark';
import { state as userState } from '../../utils/store';
import { createMap } from '../../utils/common';

export default class DetailPage extends Component {
  constructor(props) {
    super(props);
    this.$dom = this.createDom('article', {
      className: 'detailContainer',
    });
    this.appendRoot(props, this.$dom);
    this.postId = RouterContext.state.params.postId;

    axiosInstance
      .get(`/posts/${this.postId}`)
      .then(res => {
        return res.data.data;
      })
      .then(postDetailData => {
        this.setState(postDetailData);
      });
  }

  setState = postState => {
    const userId = this.findUserId();
    const userType = this.findUserType(postState.author._id);
    this.state = { ...postState, ...userState, userType, userId };
    this.makeComponent();
    this.render();
    this.addEvent();
  };

  makeComponent = () => {
    this.stacks = new Stacks({
      stackList: this.state.stacks,
    });

    this.postBanner = new PostBanner({
      stackList: this.state.stacks,
    });

    if (this.state.userType === 'author') {
      this.editButtons = new EditButtons({
        postId: this.postId,
      });
    }

    this.bookmark = new Bookmark({
      marks: this.state.marks,
      postId: this.postId,
      userType: this.state.userType,
      markedPosts: this.state.myInfo.bookmarks,
    });

    this.comments = new Comments({
      commentList: this.state.comments,
      userType: this.state.userType,
      userId: this.state.userId,
    });

    this.commentForm = new CommentForm({
      userType: this.state.userType,
      parentType: 'post',
      targetId: this.postId,
      userId: this.state.userId,
    });
  };

  render = () => {
    this.$dom.innerHTML = `
      <h2 class="detailTitle">${this.state.title}</h2>
      <div class="userWrapper">
        <img src=${this.state.author.imageURL} width="30px" height="30px" />
        <h4 class="userName">${this.state.author.nickname}</h4>
      </div>
      <div class="stacks">
        <h4 class="stacksTitle">기술스택<h4>
        <ul class="stacksReplace">
        </ul>
      </div>
      <main class="hero">
        <div class="banner">
          <img class="bannerLogo" src='${javascriptLogo}' alt="javascript" />
        </div>
        <div class="infos">
          <ul>
            <li class="info">
              <div class="region">지역</div>
              <div class="region__description">${
                this.state.address ? this.state.address : '온라인'
              }</div>
            </li>
            <li class="info">
              <div class="capacity">모집 인원</div>
              <div class="capacity__description">${this.state.capacity}명</div>
            </li>
            <li class="info">
              <div class="register">모집 기간</div>
              <div class="registerDescription">${this.state.startDate.slice(
                0,
                10,
              )} ~ ${this.state.endDate.slice(0, 10)}</div>
            </li>
            <li class="info">
              <div class="period">프로젝트 수행 기간</div>
              <div class="periodDescription">${this.state.updatedAt.slice(
                0,
                10,
              )} ~ ${this.state.registerDeadline.slice(0, 10)}</div>
            </li>
            <li class="info">
              <div class="viewWrapper">
                <img class="view" src='${viewIcon}' />
                <span class="viewCount">${this.state.views}</span>
              </div>
              <div class="bookmarkWrapper"></div>
            </li>
          </ul>
        </div>
      </main>
      <div class="descriptionWrapper">
      <h3>프로젝트 소개</h3>
      <p class="postDescription" >${this.state.content}</p>
      </div>
      <hr>
      <div class="mapWarpper">
        <h3>팀 미팅 지역</h3>
        <h4 class="mapDescription">${
          this.state.address ? this.state.address : '온라인'
        }</h3>
        <div id="map"></div>
      </div>
      <div class="commentSection">
        <hr />
        <div class="comments"></div>
        <div class="commentForm"></div>
      </div>
      <div class="editSection"></div>
    `;

    if (this.state.location.coordinates[0] === null) {
      const mapContainer = document.getElementById('map');
      mapContainer.parentNode.removeChild(mapContainer);
    } else {
      const mapContainer = document.getElementById('map');
      createMap(mapContainer, this.state.location.coordinates);
    }

    this.replaceElement(
      this.$dom.querySelector('.stacksReplace'),
      this.stacks.$dom,
    );
    this.replaceElement(
      this.$dom.querySelector('.banner'),
      this.postBanner.$dom,
    );
    this.replaceElement(
      this.$dom.querySelector('.comments'),
      this.comments.$dom,
    );
    this.replaceElement(
      this.$dom.querySelector('.commentForm'),
      this.commentForm.$dom,
    );
    this.replaceElement(
      this.$dom.querySelector('.bookmarkWrapper'),
      this.bookmark.$dom,
    );
    if (this.editButtons) {
      this.replaceElement(
        this.$dom.querySelector('.editSection'),
        this.editButtons.$dom,
      );
    }
  };

  addEvent = () => {};

  findUserId = () => {
    if (userState.myInfo) {
      return userState.myInfo._id;
    }
    return null;
  };

  findUserType = postUserId => {
    if (userState.myInfo === undefined) {
      return 'notLoggedUser';
    }
    if (userState.myInfo._id === postUserId) {
      return 'author';
    }
    return 'loggedUser';
  };
}
