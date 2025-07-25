const express = require('express');
const cors = require('cors');
const { runApriori } = require('./apriori.js');

// --- KODE UNTUK DATABASE DAN AUTENTIKASI ---
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// ---------------------------------------------

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));


// =================================================================
//   BAGIAN KONEKSI DATABASE & AUTENTIKASI
// =================================================================

// Konfigurasi koneksi ke database 'apriomarket'
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // <-- ISI PASSWORD DATABASE ANDA DI SINI
  database: 'apriomarket'
});

// Mengecek koneksi ke database
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database `apriomarket`.');
});

// Secret key untuk JWT
const JWT_SECRET = 'kunci-rahasia-apriomarket-yang-sangat-aman';

// Endpoint untuk Registrasi 📝
app.post('/api/register', async (req, res) => {
  const { User_name, Email, Password } = req.body; 

  if (!User_name || !Email || !Password) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    
    const sql = "INSERT INTO users (User_name, Email, Password) VALUES (?, ?, ?)";
    db.query(sql, [User_name, Email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: "Email atau Username sudah terdaftar." });
        }
        console.error("Database error on register:", err);
        return res.status(500).json({ message: 'Gagal mendaftarkan pengguna' });
      }
      res.status(201).json({ message: 'Registrasi berhasil!' });
    });
  } catch (error) {
    console.error("Server error on register:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});


// Endpoint untuk Login 🔑
app.post('/api/login', (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ message: 'Email dan password harus diisi' });
  }

  const sql = "SELECT * FROM users WHERE Email = ?";
  db.query(sql, [Email], async (err, results) => {
    if (err) {
        console.error("Database error on login:", err);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = results[0];
    const isPasswordMatch = await bcrypt.compare(Password, user.Password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign({ id: user.User_id, email: user.Email }, JWT_SECRET, {
      expiresIn: '1h' 
    });

    res.json({ message: 'Login berhasil!', token: token });
  });
});

// Middleware untuk verifikasi token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ message: 'Token tidak tersedia.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token tidak valid.' });
    }
    req.userId = decoded.id; 
    next();
  });
};

// Endpoint untuk mendapatkan data profil pengguna
app.get('/api/profile', verifyToken, (req, res) => {
  const sql = "SELECT User_name, Email FROM users WHERE User_id = ?";

  db.query(sql, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    res.json(results[0]); 
  });
});

// =================================================================
//  TAMBAHKAN KODE INI DI server.js ANDA
// =================================================================
// Endpoint untuk MENGGANTI PASSWORD (untuk pengguna yang sudah login)
app.post('/api/change-password', verifyToken, (req, res) => {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    // 1. Validasi input dari frontend
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Password lama dan baru harus diisi.' });
    }

    // 2. Ambil password saat ini dari database untuk perbandingan
    const selectSql = "SELECT Password FROM users WHERE User_id = ?";
    db.query(selectSql, [userId], async (err, results) => {
        if (err) {
            console.error("Database error on getting user for password change:", err);
            return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        const user = results[0];
        
        // 3. Bandingkan password lama yang diberikan dengan yang ada di database
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.Password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Password lama salah.' });
        }
        
        // 4. Jika password lama cocok, hash password baru
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // 5. Update password di database dengan yang baru
        const updateSql = "UPDATE users SET Password = ? WHERE User_id = ?";
        db.query(updateSql, [newHashedPassword, userId], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("Database error on updating password:", updateErr);
                return res.status(500).json({ message: 'Gagal memperbarui password.' });
            }
            res.status(200).json({ message: 'Password berhasil diubah!' });
        });
    });
});


// Endpoint untuk mengganti username
app.put('/api/update-username', verifyToken, (req, res) => {
  const userId = req.userId;
  const { newUsername } = req.body;

  if (!newUsername || newUsername.trim() === '') {
    return res.status(400).json({ message: 'Username baru tidak boleh kosong.' });
  }

  const checkSql = "SELECT User_id FROM users WHERE User_name = ? AND User_id != ?";
  db.query(checkSql, [newUsername, userId], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ message: 'Database error saat memeriksa username.' });
    }
    if (checkResults.length > 0) {
      return res.status(409).json({ message: 'Username tersebut sudah digunakan.' });
    }

    const updateSql = "UPDATE users SET User_name = ? WHERE User_id = ?";
    db.query(updateSql, [newUsername, userId], (updateErr, updateResult) => {
      if (updateErr) {
        return res.status(500).json({ message: 'Gagal memperbarui username.' });
      }
      res.status(200).json({ 
        message: 'Username berhasil diperbarui!',
        newUsername: newUsername 
      });
    });
   });
});

// --- GANTI ENDPOINT LAMA ANDA DENGAN YANG INI ---
// Endpoint untuk mengganti email dengan penanganan error yang lebih baik
app.put('/api/update-email', verifyToken, (req, res) => {
    try {
        const userId = req.userId;
        const { newEmail } = req.body;

        // 1. Validasi input
        if (!newEmail || newEmail.trim() === '') {
            return res.status(400).json({ message: 'Email baru tidak boleh kosong.' });
        }
        if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
            return res.status(400).json({ message: 'Format email tidak valid.' });
        }

        // 2. Cek apakah email baru sudah digunakan oleh orang lain
        const checkSql = "SELECT User_id FROM users WHERE Email = ? AND User_id != ?";
        db.query(checkSql, [newEmail, userId], (checkErr, checkResults) => {
            if (checkErr) {
                console.error("Database error on checking email:", checkErr);
                return res.status(500).json({ message: 'Database error saat memeriksa email.' });
            }
            if (checkResults.length > 0) {
                return res.status(409).json({ message: 'Email tersebut sudah digunakan.' });
            }

            // 3. Jika aman, update email di database
            const updateSql = "UPDATE users SET Email = ? WHERE User_id = ?";
            db.query(updateSql, [newEmail, userId], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Database error on updating email:", updateErr);
                    return res.status(500).json({ message: 'Gagal memperbarui email.' });
                }
                res.status(200).json({ 
                    message: 'Email berhasil diperbarui!',
                    newEmail: newEmail 
                });
            });
        });

    } catch (error) {
        // Jaring pengaman untuk menangkap error yang tidak terduga
        console.error("UNEXPECTED ERROR in /api/update-email:", error);
        return res.status(500).json({ message: "Terjadi kesalahan tak terduga pada server." });
    }
});

// Endpoint untuk MENGHAPUS AKUN (untuk pengguna yang sudah login)

// --- BARU: Endpoint untuk menghapus akun pengguna ---
app.delete('/api/delete-account', verifyToken, (req, res) => {
    const userId = req.userId;

    // 1. Hapus semua file yang terkait dengan pengguna
    const deleteFilesSql = "DELETE FROM uploaded_files WHERE user_id = ?";
    db.query(deleteFilesSql, [userId], (err, fileResult) => {
        if (err) {
            console.error("Database error on deleting user files:", err);
            return res.status(500).json({ message: 'Gagal menghapus data file pengguna.' });
        }
        
        console.log(`Berhasil menghapus file untuk user ID: ${userId}`);

        // 2. Hapus pengguna dari tabel users
        const deleteUserSql = "DELETE FROM users WHERE User_id = ?";
        db.query(deleteUserSql, [userId], (userErr, userResult) => {
            if (userErr) {
                console.error("Database error on deleting user:", userErr);
                return res.status(500).json({ message: 'Gagal menghapus akun pengguna.' });
            }

            if (userResult.affectedRows === 0) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan untuk dihapus.' });
            }
            
            res.status(200).json({ message: 'Akun berhasil dihapus secara permanen.' });
        });
    });
});

// =================================================================
//   BAGIAN Reset Password
// =================================================================
// ================================================
// KONFIGURASI NODEMAILER UNTUK GMAIL APRIOMARKET
// ================================================
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'apriomarket@gmail.com',
    pass: 'eooxxfevohxqvune', // GANTI: Gunakan App Password Gmail
  },
});

// ================================================
// ENDPOINT KIRIM LINK RESET PASSWORD
// ================================================
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email harus diisi' });
  }

  // 1. Cari user berdasarkan email
  const sql = "SELECT * FROM users WHERE Email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("DB error forgot-password:", err);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Email tidak ditemukan' });
    }

    const user = results[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 jam

    // 2. Simpan token & expiry ke tabel users
    const updateSql = "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE User_id = ?";
    db.query(updateSql, [token, expiry, user.User_id], (updateErr) => {
      if (updateErr) {
        console.error("DB error save token:", updateErr);
        return res.status(500).json({ message: 'Gagal menyimpan token reset' });
      }

      // 3. Kirim email link reset
      const resetLink = `http://localhost:5173/newpassword?token=${token}`;

      const mailOptions = {
        from: 'apriomarket@gmail.com',
        to: email,
        subject: 'Reset Password AprioMarket',
        html: `<p>Anda meminta reset password. Klik link di bawah ini:</p>
               <a href="${resetLink}">${resetLink}</a>
               <p>Link ini berlaku 1 jam.</p>`,
      };

      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          console.error("Error kirim email:", mailErr);
          return res.status(500).json({ message: 'Gagal mengirim email reset' });
        }
        res.json({ message: 'Link reset password telah dikirim ke email Anda.' });
      });
    });
  });
});

// ================================================
// ENDPOINT UPDATE PASSWORD MENGGUNAKAN TOKEN
// ================================================
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token dan password harus diisi' });
  }

  const sql = "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()";
  db.query(sql, [token], async (err, results) => {
    if (err) {
      console.error("DB error reset-password:", err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'Token tidak valid atau kadaluarsa' });
    }

    const user = results[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    const updateSql = "UPDATE users SET Password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE User_id = ?";
    db.query(updateSql, [hashedPassword, user.User_id], (updateErr) => {
      if (updateErr) {
        console.error("DB error update password:", updateErr);
        return res.status(500).json({ message: 'Gagal memperbarui password' });
      }
      res.json({ message: 'Password berhasil diperbarui!' });
    });
  });
});


// =================================================================
//   BAGIAN UPLOAD, RIWAYAT, DAN ANALISA FILE
// =================================================================

// Endpoint untuk MENYIMPAN file dan MENGANALISA
// Di dalam file server.js

// Endpoint untuk MENYIMPAN file dan MENGANALISA
app.post('/api/upload-and-analyze', verifyToken, (req, res) => {
    const { transactions, minSupport, minConfidence, fileName, transactionalDataForApriori } = req.body;
    const userId = req.userId;

    if (!transactions || !transactionalDataForApriori || !fileName || minSupport == null || minConfidence == null) {
        return res.status(400).json({ error: 'Parameter tidak lengkap dari frontend.' });
    }

    // 1. Simpan file baru ke database
    const fileContent = JSON.stringify(transactions); 
    const insertSql = "INSERT INTO uploaded_files (user_id, file_name, file_content) VALUES (?, ?, ?)";
    
    db.query(insertSql, [userId, fileName, fileContent], (err, result) => {
        if (err) {
            console.error("Database error on file save:", err);
            return res.status(500).json({ error: 'Gagal menyimpan file ke database.' });
        }
        console.log(`File '${fileName}' berhasil disimpan untuk user ID: ${userId}.`);

        // ======================= KODE BARU DITAMBAHKAN DI SINI =======================
        // 2. CLEANUP: Hapus file terlama jika total file lebih dari 5
        const cleanupSql = `
            DELETE FROM uploaded_files 
            WHERE user_id = ? AND file_id NOT IN (
                SELECT file_id FROM (
                    SELECT file_id FROM uploaded_files 
                    WHERE user_id = ? 
                    ORDER BY upload_timestamp DESC 
                    LIMIT 5
                ) AS temp_table
            )
        `;
        db.query(cleanupSql, [userId, userId], (cleanupErr, cleanupResult) => {
            if (cleanupErr) {
                console.error("Gagal membersihkan file lama:", cleanupErr);
                // Proses tetap lanjut meskipun cleanup gagal
            }
            if (cleanupResult && cleanupResult.affectedRows > 0) {
                console.log(`Berhasil membersihkan ${cleanupResult.affectedRows} file lama untuk user ID: ${userId}.`);
            }
        });
        // ===========================================================================

        // 3. Lanjutkan dengan analisa Apriori
        try {
            const aprioriResults = runApriori(transactionalDataForApriori, minSupport, minConfidence);
            const rulesWithRecommendations = generatePromotionRecommendations(aprioriResults.associationRules);
            
            console.log(`Analisa Apriori selesai, ditemukan ${rulesWithRecommendations.length} aturan.`);

            res.status(200).json({
                ...aprioriResults,
                associationRules: rulesWithRecommendations
            });
        } catch (error) {
            console.error("Error selama analisa Apriori:", error);
            res.status(500).json({ error: 'Terjadi kesalahan internal saat analisa.' });
        }
    });
});

// Endpoint untuk MENDAPATKAN 5 file terakhir yang di-upload oleh user
app.get('/api/recent-uploads', verifyToken, (req, res) => {
    const userId = req.userId;
    const sql = "SELECT file_id, file_name, upload_timestamp FROM uploaded_files WHERE user_id = ? ORDER BY upload_timestamp DESC LIMIT 5";

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database error on fetching recent uploads:", err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});


// Endpoint untuk MENDAPATKAN KONTEN file spesifik berdasarkan ID-nya
app.get('/api/file/:fileId', verifyToken, (req, res) => {
    const userId = req.userId;
    const fileId = req.params.fileId;

    const sql = "SELECT file_name, file_content FROM uploaded_files WHERE file_id = ? AND user_id = ?";

    db.query(sql, [fileId, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'File tidak ditemukan atau Anda tidak memiliki akses.' });
        }
        
        const fileData = {
            fileName: results[0].file_name,
            previewData: JSON.parse(results[0].file_content) 
        };
        res.json(fileData);
    });
});

// =================================================================
//   BAGIAN FUNGSI REKOMENDASI PROMOSI
// =================================================================
function generatePromotionRecommendations(associationRules) {
    return associationRules.map(rule => {
        let recommendation = {
            promoType: 'Diskon',
            promoText: `Berikan diskon untuk produk "${rule.consequent}" jika pelanggan membeli "${rule.antecedent}".`
        };

        if (rule.confidence >= 0.75) {
            recommendation = {
                promoType: 'Bundling',
                promoText: `Buat paket bundling hemat untuk "${rule.antecedent}" dan "${rule.consequent}". Keduanya sangat sering dibeli bersamaan!`
            };
        } else if (rule.confidence >= 0.6) {
             recommendation = {
                promoType: 'Tebus Murah',
                promoText: `Tawarkan promo "Tebus Murah" untuk "${rule.consequent}" setelah pelanggan membeli "${rule.antecedent}".`
            };
        }
        
        if (rule.confidence > 0.85) {
             recommendation = {
                promoType: 'Buy 1 Get 1',
                promoText: `Promo Beli 1 "${rule.antecedent}", Gratis 1 "${rule.consequent}" akan sangat menarik karena hubungannya sangat kuat.`
            };
        }

        return {
            ...rule,
            recommendation
        };
    });
}

// =================================================================
//   MEMULAI SERVER
// =================================================================
app.listen(PORT, () => {
    console.log(`Backend server berjalan di http://localhost:${PORT}`);
});