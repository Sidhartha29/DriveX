import QRCode from 'qrcode';

export const generateQRCode = async (bookingData) => {
  try {
    // Prepare QR code data
    const qrDataString = JSON.stringify({
      bookingId: bookingData.bookingId,
      userId: bookingData.userId,
      busId: bookingData.busId,
      seats: bookingData.seats,
      travelDate: bookingData.travelDate,
      totalPrice: bookingData.totalPrice
    });

    // Generate QR code as data URL (base64)
    const qrCode = await QRCode.toDataURL(qrDataString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300
    });

    return qrCode;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

export default generateQRCode;
