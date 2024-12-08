import { classListForm } from "../components/utils/constants.js";
import { apiConfig } from "../api/config.js";
import { FormValidator } from "../components/FormValidator.js";
import { Card } from "../components/Card.js";
import { Section } from "../components/Section.js";
import { PopupNotice } from "../components/PopupNotice.js";
import { PopupWithImage } from "../components/PopupWithImage.js";
import { PopupWithForm } from "../components/PopupWithForm.js";
import { User } from "../components/User.js";
import { Api } from "../api/Api.js";
import "./index.css";
import {
  profileEditingIcon,
  iconAddCard,
  formCards,
  formProfile,
  nameInput,
  descriptionInput,
  popupAvatarEditForm,
  iconAvatarEdit,
} from "../components/utils/elements.js";

const api = new Api(apiConfig);

let userId;
const user = new User({
  usernameSelector: ".profile__name",
  userDescriptionSelector: ".profile__description",
  userAvatarSelector: ".profile__avatar",
});
const renderCard = function (cardObject) {
  const cardItem = new Card(
    cardObject,
    "#card-template",
    userId,
    { cardId: cardObject._id, authorId: cardObject.owner._id },
    {
      handleCardZoom: (name, image) => {
        popupImageZoom.open(name, image);
      },
      handleCardDelete: (cardElement, cardId) => {
        popupNoticeDelete.open(cardElement, cardId);
      },
      handleCardLike: (cardId) => {
        api
          .putCardLike(cardId)
          .then((res) => {
            cardItem.renderCardLike(res);
          })
          .catch((err) => {
            console.log(`При лайке карточки возникла ошибка, ${err}`);
          });
      },
      handleCardDeleteLike: (cardId) => {
        api
          .deleteCardLike(cardId)
          .then((res) => {
            cardItem.renderCardLike(res);
          })
          .catch((err) => {
            console.log(`При дизлайке карточки возникла ошибка, ${err}`);
          });
      },
    },
  );
  return cardItem.makeCard();
};
const renderInitialCards = new Section(
  {
    renderer: (cardObject) => {
      renderInitialCards.addItem(renderCard(cardObject));
    },
  },
  ".cards",
);
Promise.all([api.getUserData(), api.getInitialCards()])
  .then(([userProfileData, cardObject]) => {
    userId = userProfileData._id;
    user.update({
      username: userProfileData.name,
      description: userProfileData.about,
    });
    renderInitialCards.renderItems(cardObject.reverse());
    user.setAvatar(userProfileData.avatar);
  })
  .catch((err) => { 
    console.log(err)
  });
const popupImageZoom = new PopupWithImage("#image-popup");
popupImageZoom.setEventListeners();
const popupEditeAvatar = new PopupWithForm("#avatar-popup", {
  callbackFormSubmit: (userProfileData) => {
    popupEditeAvatar.putSavingProcessText();
    api
      .sendAvatarData(userProfileData)
      .then((res) => {
        user.setAvatar(res.avatar);
        popupEditeAvatar.close();
      })
      .catch((err) => {
        console.log(`При обновлении аватара возникла ошибка, ${err}`);
      })
      .finally(() => {
        popupEditeAvatar.returnSavingProcessText();
      });
  },
});
popupEditeAvatar.setEventListeners();
const popupNoticeDelete = new PopupNotice("#delete-card", {
  callbackNotice: (cardElement, cardId) => {
    api
      .deleteCard(cardId)
      .then(() => {
        cardElement.deleteCard();
        popupNoticeDelete.close();
      })
      .catch((err) => {
        console.log(`При удалении карточки возникла ошибка, ${err}`);
      });
  },
});
popupNoticeDelete.setEventListeners();
const popupEditeProfile = new PopupWithForm("#profile-popup", {
  callbackFormSubmit: (userProfileData) => {
    popupEditeProfile.putSavingProcessText();
    api
      .sendUserData(userProfileData)
      .then((res) => {
        user.update({ username: res.name, description: res.about });
        popupEditeProfile.close();
      })
      .catch((err) => {
        console.log(`При редактировании профиля возникла ошибка, ${err}`);
      })
      .finally(() => {
        popupEditeProfile.returnSavingProcessText();
      });
  },
});
popupEditeProfile.setEventListeners();
const popupAddCard = new PopupWithForm("#cards-popup", {
  callbackFormSubmit: (formValues) => {
    popupAddCard.putSavingProcessText();
    api
      .addNewCard({ name: formValues.placename, link: formValues.placeimage })
      .then((card) => {
        renderInitialCards.addItem(renderCard(card));
        popupAddCard.close();
      })
      .catch((err) => {
        console.log(`При добавлении новой карточки возникла ошибка, ${err}`);
      })
      .finally(() => {
        popupAddCard.returnSavingProcessText();
      });
  },
});
popupAddCard.setEventListeners();

const { cardItemValidate, profileEditValidate, profileAvatarEditValidate } =
  (() => {
    const init = (sel) => {
      const validator = new FormValidator(classListForm, sel);
      validator.enableValidationCheck();
      return validator;
    };
    return {
      cardItemValidate: init(formCards),
      profileEditValidate: init(formProfile),
      profileAvatarEditValidate: init(popupAvatarEditForm),
    };
  })();

profileEditingIcon.addEventListener("click", function () {
  popupEditeProfile.open();
  profileEditValidate.resetValidate();
  const actualUser = user.get();
  nameInput.value = actualUser.username;
  descriptionInput.value = actualUser.description;
});

iconAvatarEdit.addEventListener("click", function () {
  popupEditeAvatar.open();
  profileAvatarEditValidate.resetValidate();
});

iconAddCard.addEventListener("click", function () {
  popupAddCard.open();
  cardItemValidate.resetValidate();
});
