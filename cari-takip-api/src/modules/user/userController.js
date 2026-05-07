/**
 * User Controller
 * Kullanıcı işlemlerini yönet (kayıt, giriş, profil, etc.)
 */

const userModel = require('./userModel');
const { generateToken, updateLastLogin } = require('../../middleware/authMiddleware');
const { logAction } = require('../../middleware/loggingMiddleware');
const { AppError, asyncHandler } = require('../../middleware/errorHandler');

/**
 * Kullanıcı kayıt (Register)
 */
const register = asyncHandler(async (req, res) => {
  const { kullanici_adi, email, sifre, sifre_confirm, ad_soyad } = req.body;

  // Validasyon
  if (!kullanici_adi || !email || !sifre) {
    throw new AppError('Kullanıcı adı, email ve şifre gereklidir', 400);
  }

  if (sifre !== sifre_confirm) {
    throw new AppError('Şifreler eşleşmiyor', 400);
  }

  if (sifre.length < 6) {
    throw new AppError('Şifre en az 6 karakter olmalıdır', 400);
  }

  // Kullanıcı adı ve email kontrolü
  const existingUser = await userModel.getUserByUsername(kullanici_adi);
  if (existingUser) {
    throw new AppError('Bu kullanıcı adı zaten kayıtlıdır', 400);
  }

  const existingEmail = await userModel.getUserByEmail(email);
  if (existingEmail) {
    throw new AppError('Bu email zaten kayıtlıdır', 400);
  }

  // Yeni kullanıcı oluştur
  const newUser = await userModel.createUser({
    kullanici_adi,
    email,
    sifre,
    ad_soyad
  });

  // Loglama
  await logAction(
    newUser.id,
    'user',
    'CREATE',
    'user',
    newUser.id,
    null,
    newUser,
    req.ip,
    req.get('user-agent')
  );

  res.status(201).json({
    success: true,
    message: 'Kullanıcı başarıyla oluşturuldu',
    data: {
      id: newUser.id,
      kullanici_adi: newUser.kullanici_adi,
      email: newUser.email,
      ad_soyad: newUser.ad_soyad
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Kullanıcı giriş (Login)
 */
const login = asyncHandler(async (req, res) => {
  const { kullanici_adi, sifre } = req.body;

  if (!kullanici_adi || !sifre) {
    throw new AppError('Kullanıcı adı ve şifre gereklidir', 400);
  }

  // Kullanıcıyı bul
  const user = await userModel.getUserByUsername(kullanici_adi);
  if (!user) {
    throw new AppError('Kullanıcı adı veya şifre hatalı', 401);
  }

  // Şifreyi doğrula
  const isPasswordValid = await userModel.verifyPassword(sifre, user.sifre);
  if (!isPasswordValid) {
    throw new AppError('Kullanıcı adı veya şifre hatalı', 401);
  }

  // Son giriş zamanını güncelle
  await userModel.updateLastLogin(user.id);

  // Token oluştur
  const token = generateToken(user.id, user.rol);

  // Loglama
  await logAction(
    user.id,
    'user',
    'LOGIN',
    'user',
    user.id,
    null,
    { kullanici_adi, timestamp: new Date() },
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Giriş başarılı',
    data: {
      token,
      user: {
        id: user.id,
        kullanici_adi: user.kullanici_adi,
        email: user.email,
        ad_soyad: user.ad_soyad,
        rol: user.rol
      }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Tüm kullanıcıları listele (Sadece admin)
 */
const listUsers = asyncHandler(async (req, res) => {
  const users = await userModel.getAllUsers();

  res.status(200).json({
    success: true,
    message: 'Tüm kullanıcılar başarıyla getirildi',
    count: users.length,
    data: users,
    timestamp: new Date().toISOString()
  });
});

/**
 * Kullanıcı profilini getir
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const user = await userModel.getUserById(userId);

  if (!user) {
    throw new AppError('Kullanıcı bulunamadı', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Profil başarıyla getirildi',
    data: user,
    timestamp: new Date().toISOString()
  });
});

/**
 * Kullanıcı profilini güncelle
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { ad_soyad, email } = req.body;

  if (!ad_soyad && !email) {
    throw new AppError('En az bir alan güncellenmelidir', 400);
  }

  const oldUser = await userModel.getUserById(userId);
  if (!oldUser) {
    throw new AppError('Kullanıcı bulunamadı', 404);
  }

  const updatedUser = await userModel.updateUser(userId, {
    ad_soyad: ad_soyad || oldUser.ad_soyad,
    email: email || oldUser.email
  });

  // Loglama
  await logAction(
    userId,
    'user',
    'UPDATE',
    'user',
    userId,
    { ad_soyad: oldUser.ad_soyad, email: oldUser.email },
    { ad_soyad: updatedUser.ad_soyad, email: updatedUser.email },
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Profil başarıyla güncellendi',
    data: updatedUser,
    timestamp: new Date().toISOString()
  });
});

/**
 * Şifreyi değiştir
 */
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { eski_sifre, yeni_sifre, yeni_sifre_confirm } = req.body;

  if (!eski_sifre || !yeni_sifre) {
    throw new AppError('Eski şifre ve yeni şifre gereklidir', 400);
  }

  if (yeni_sifre !== yeni_sifre_confirm) {
    throw new AppError('Yeni şifreler eşleşmiyor', 400);
  }

  if (yeni_sifre.length < 6) {
    throw new AppError('Yeni şifre en az 6 karakter olmalıdır', 400);
  }

  const user = await userModel.getUserById(userId);
  if (!user) {
    throw new AppError('Kullanıcı bulunamadı', 404);
  }

  // Eski şifreyi doğrula
  const isPasswordValid = await userModel.verifyPassword(eski_sifre, user.sifre);
  if (!isPasswordValid) {
    throw new AppError('Eski şifre hatalı', 401);
  }

  await userModel.changePassword(userId, yeni_sifre);

  // Loglama
  await logAction(
    userId,
    'user',
    'CHANGE_PASSWORD',
    'user',
    userId,
    null,
    { timestamp: new Date() },
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Şifre başarıyla değiştirildi',
    timestamp: new Date().toISOString()
  });
});

/**
 * Oturum kapat (Logout) - Frontend tarafında token silinecek
 */
const logout = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Loglama
  await logAction(
    userId,
    'user',
    'LOGOUT',
    'user',
    userId,
    null,
    { timestamp: new Date() },
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Oturum başarıyla kapatıldı',
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  register,
  login,
  listUsers,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
