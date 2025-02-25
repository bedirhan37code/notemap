import { goToIcon, homeIcon, jobIcon, parkIcon } from "./constants.js";

// Note'un statis değeri neyse bunun için düzenleme fonksiyon

const getStatus = (status) => {
  switch (status) {
    case "goto":
      return "ziyaret";
    case "home":
      return "Ev";
    case "park":
      return "Park";
    case "job":
      return "iş";
    default:
      return "Tanımsız Durum";
  }
};

// Her status için gerekli icona karar veren fonskiyo

const getNoteIcon = (status) => {
  switch (status) {
    case "goto":
      return goToIcon;
    case "home":
      return homeIcon;
    case "park":
      return parkIcon;
    case "job":
      return jobIcon;
    default:
      return null;
  }
};

export { getStatus, getNoteIcon };
