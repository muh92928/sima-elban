import { relations } from "drizzle-orm/relations";
import { peralatan, logPeralatan, akun, tugas, pengaduan } from "./schema";

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

export const akunRelations = relations(akun, ({many}) => ({
	tugases_dibuatOlehNip: many(tugas, {
		relationName: "tugas_dibuatOlehNip_akun_nip"
	}),
	tugases_ditugaskanKeNip: many(tugas, {
		relationName: "tugas_ditugaskanKeNip_akun_nip"
	}),
	pengaduans: many(pengaduan),
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