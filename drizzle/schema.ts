import { pgTable, foreignKey, check, bigint, timestamp, date, time, text, integer, index, varchar, unique, pgPolicy, uuid, serial, pgEnum } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

export const userPeranEnum = pgEnum("user_peran_enum", ['KEPALA_BANDARA', 'KASI_TOKPD', 'KASI_JASA', 'KASUBAG_TU', 'KANIT_ELBAN', 'TEKNISI_ELBAN', 'UNIT_BANGLAN', 'UNIT_HUMAS', 'UNIT_LISTRIK', 'UNIT_ADMIN', 'UNIT_A2B', 'UNIT_PK', 'UNIT_AVSEC', 'UNIT_INFORMASI', 'UNIT_TATA_TERMINAL']);


export const logPeralatan = pgTable("log_peralatan", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "log_peralatan_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	tanggal: date().notNull(),
	jam: time().notNull(),
	peralatanId: bigint("peralatan_id", { mode: "number" }).notNull(),
	kegiatan: text().notNull(),
	keterangan: text(),
	pic: text().notNull(),
	dokumentasi: text(),
	waktuOperasiAktual: integer("waktu_operasi_aktual").default(0),
	waktuOperasiDiterapkan: integer("waktu_operasi_diterapkan").default(0),
	mematikanTerjadwal: integer("mematikan_terjadwal").default(0),
	periodeKegagalan: integer("periode_kegagalan").default(0),
	status: text().default('Normal Ops'),
	diupdateKapan: timestamp("diupdate_kapan", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.peralatanId],
			foreignColumns: [peralatan.id],
			name: "log_peralatan_peralatan_id_fkey"
		}),
	check("log_peralatan_status_check", sql`status = ANY (ARRAY['Normal Ops'::text, 'Perlu Perbaikan'::text, 'Perlu Perawatan'::text])`),
]);

export const notes = pgTable("notes", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "notes_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	tittle: text(),
});

export const tugas = pgTable("tugas", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "tugas_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	peralatanId: bigint("peralatan_id", { mode: "number" }),
	judul: varchar({ length: 255 }),
	deskripsi: text().notNull(),
	status: varchar({ length: 20 }).default('PENDING'),
	sumber: varchar({ length: 50 }).default('KANIT'),
	dibuatOlehNip: varchar("dibuat_oleh_nip", { length: 50 }),
	ditugaskanKeNip: varchar("ditugaskan_ke_nip", { length: 50 }),
	dibuatKapan: timestamp("dibuat_kapan", { withTimezone: true, mode: 'string' }).defaultNow(),
	diupdateKapan: timestamp("diupdate_kapan", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_tugas_ditugaskan_ke").using("btree", table.ditugaskanKeNip.asc().nullsLast().op("text_ops")),
	index("idx_tugas_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.dibuatOlehNip],
			foreignColumns: [akun.nip],
			name: "fk_tugas_pembuat"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.ditugaskanKeNip],
			foreignColumns: [akun.nip],
			name: "fk_tugas_teknisi"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.peralatanId],
			foreignColumns: [peralatan.id],
			name: "tugas_peralatan_id_fkey"
		}).onDelete("set null"),
	check("tugas_status_check", sql`(status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROSES'::character varying, 'SELESAI'::character varying])::text[])`),
]);

export const akun = pgTable("akun", {
	id: uuid().primaryKey().notNull(),
	nip: text(),
	nama: text(),
	peran: userPeranEnum(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	email: text(),
	status: text().default('pending'),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [users.id],
			name: "akun_id_fkey"
		}).onDelete("cascade"),
	unique("akun_nip_key").on(table.nip),
	pgPolicy("Data akun bisa dilihat publik", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("User bisa buat akun sendiri", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("User bisa update akun sendiri", { as: "permissive", for: "update", to: ["public"] }),
	check("akun_status_check", sql`status = ANY (ARRAY['AKTIF'::text, 'NONAKTIF'::text, 'pending'::text, 'approved'::text, 'rejected'::text])`),
]);

export const peralatan = pgTable("peralatan", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "peralatan_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	nama: text().notNull(),
	jenis: text().notNull(),
	merk: text(),
	noSertifikat: text("no_sertifikat").default('-'),
	tahunInstalasi: integer("tahun_instalasi"),
	kondisiPersen: integer("kondisi_persen"),
	statusLaik: text("status_laik"),
	keterangan: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	check("peralatan_status_laik_check", sql`status_laik = ANY (ARRAY['LAIK OPERASI'::text, 'TIDAK LAIK OPERASI'::text])`),
]);

export const personel = pgTable("personel", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	nama: text().notNull(),
	nip: text(),
	tempatLahir: text("tempat_lahir"),
	tanggalLahir: date("tanggal_lahir"),
	jabatan: text(),
	formasiPendidikan: text("formasi_pendidikan"),
	kompetensiPendidikan: text("kompetensi_pendidikan"),
	noSertifikat: text("no_sertifikat"),
	jenisSertifikat: text("jenis_sertifikat"),
	keterangan: text(),
}, (table) => [
	pgPolicy("Enable read access for authenticated users", { as: "permissive", for: "select", to: ["public"], using: sql`(auth.role() = 'authenticated'::text)` }),
	pgPolicy("Enable write access for authenticated users", { as: "permissive", for: "all", to: ["public"] }),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const posts = pgTable("posts", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	content: text(),
	authorId: uuid("author_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "posts_author_id_users_id_fk"
		}),
]);

export const jadwal = pgTable("jadwal", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "jadwal_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	namaKegiatan: text("nama_kegiatan").notNull(),
	tanggal: date().notNull(),
	waktu: time().notNull(),
	lokasi: text().notNull(),
	keterangan: text(),
});

export const files = pgTable("files", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "files_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	nama: text().notNull(),
	kategori: text().notNull(),
	catatan: text(),
	url: text().notNull(),
	tipe: text(),
	ukuran: bigint({ mode: "number" }),
});

export const pengaduan = pgTable("pengaduan", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "pengaduan_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	deskripsi: text().notNull(),
	status: text().default('Baru').notNull(),
	dokumentasi: text(),
	buktiPetugas: text("bukti_petugas"),
	peralatanId: bigint("peralatan_id", { mode: "number" }),
	akunId: uuid("akun_id"),
}, (table) => [
	foreignKey({
			columns: [table.peralatanId],
			foreignColumns: [peralatan.id],
			name: "fk_pengaduan_peralatan"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.akunId],
			foreignColumns: [akun.id],
			name: "pengaduan_akun_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.peralatanId],
			foreignColumns: [peralatan.id],
			name: "pengaduan_peralatan_id_fkey"
		}),
	pgPolicy("Enable delete access for all users", { as: "permissive", for: "delete", to: ["public"], using: sql`true` }),
	pgPolicy("Enable insert access for all users", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Enable insert for authenticated users", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Enable read access for all", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Enable read access for authenticated users", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("Enable update access for all users", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Enable update for technicians and admins", { as: "permissive", for: "update", to: ["public"] }),
	check("pengaduan_status_check", sql`status = ANY (ARRAY['Baru'::text, 'Diproses'::text, 'Selesai'::text])`),
]);

// RELATIONS
export const logPeralatanRelations = relations(logPeralatan, ({one}) => ({
	peralatan: one(peralatan, {
		fields: [logPeralatan.peralatanId],
		references: [peralatan.id]
	}),
}));

export const peralatanRelations = relations(peralatan, ({many}) => ({
	logPeralatans: many(logPeralatan),
	tugases: many(tugas),
	pengaduans: many(pengaduan, {
		relationName: "pengaduan_peralatanId_peralatan_id"
	}),
}));

export const tugasRelations = relations(tugas, ({one}) => ({
	akun_dibuatOlehNip: one(akun, {
		fields: [tugas.dibuatOlehNip],
		references: [akun.nip],
		relationName: "tugas_dibuatOlehNip_akun_nip"
	}),
	akun_ditugaskanKeNip: one(akun, {
		fields: [tugas.ditugaskanKeNip],
		references: [akun.nip],
		relationName: "tugas_ditugaskanKeNip_akun_nip"
	}),
	peralatan: one(peralatan, {
		fields: [tugas.peralatanId],
		references: [peralatan.id]
	}),
}));

export const akunRelations = relations(akun, ({one, many}) => ({
	tugases_dibuatOlehNip: many(tugas, {
		relationName: "tugas_dibuatOlehNip_akun_nip"
	}),
	tugases_ditugaskanKeNip: many(tugas, {
		relationName: "tugas_ditugaskanKeNip_akun_nip"
	}),
	// usersInAuth relation removed as table is not introspected
	pengaduans: many(pengaduan),
}));

export const postsRelations = relations(posts, ({one}) => ({
	user: one(users, {
		fields: [posts.authorId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	posts: many(posts),
}));

export const pengaduanRelations = relations(pengaduan, ({one}) => ({
	peralatan: one(peralatan, {
		fields: [pengaduan.peralatanId],
		references: [peralatan.id],
		relationName: "pengaduan_peralatanId_peralatan_id"
	}),
	akun: one(akun, {
		fields: [pengaduan.akunId],
		references: [akun.id]
	}),
}));
