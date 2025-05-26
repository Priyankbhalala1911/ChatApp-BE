export const generateRandomImage = () => {
  const avatars = [
    "https://res.cloudinary.com/dhd86c3ax/image/upload/v1747980070/image4_ienzkj.jpg",
    "https://res.cloudinary.com/dhd86c3ax/image/upload/v1747980060/image3_qr6ppr.jpg",
    "https://res.cloudinary.com/dhd86c3ax/image/upload/v1747980050/image2_szvy5o.jpg",
    "https://res.cloudinary.com/dhd86c3ax/image/upload/v1747980038/image1_dtvigf.jpg",
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
};
