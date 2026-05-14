import type { Person, Link, FamilyEvent } from '@/types'

const FAM = 'demo-family'

export const DEMO_PERSONS: Person[] = [
  { id:'p1',  family_id:FAM, name:'Carlos Enrique', last:'Mendoza Ríos',        gender:'M', born:'1960-03-15', died:null, born_place:'Quito, Ecuador',     died_place:null, nationality:'Ecuador', address:'Av. República 123', phone:'099 123 4567', email:'carlos@example.com', country:'Ecuador',  city:'Quito',     lat:-0.180, lng:-78.467, is_root:true,  cedula:'1700000001', profession:'Ingeniero Civil',  notes:'Patriarca de la familia', photo_url:null, created_at:'', created_by:null },
  { id:'p2',  family_id:FAM, name:'María Elena',    last:'Torres Vega',          gender:'F', born:'1963-07-22', died:null, born_place:'Guayaquil, Ecuador',  died_place:null, nationality:'Ecuador', address:'Av. República 123', phone:'098 765 4321', email:'maria@example.com',  country:'Ecuador',  city:'Quito',     lat:-0.182, lng:-78.469, is_root:false, cedula:'1700000002', profession:'Docente',          notes:'', photo_url:null, created_at:'', created_by:null },
  { id:'p3',  family_id:FAM, name:'Carmen Lucía',   last:'Vargas Mora',          gender:'F', born:'1970-04-18', died:null, born_place:'Ambato, Ecuador',     died_place:null, nationality:'Ecuador', address:'Av. Amazonas 55',   phone:'099 777 3333', email:'carmen@example.com', country:'Ecuador',  city:'Ambato',    lat:-1.249, lng:-78.617, is_root:false, cedula:'1700000003', profession:'Contadora',        notes:'Segunda pareja de Carlos', photo_url:null, created_at:'', created_by:null },
  { id:'p4',  family_id:FAM, name:'Roberto',        last:'Mendoza Salas',        gender:'M', born:'1930-01-01', died:'1998-05-10', born_place:'Cuenca, Ecuador', died_place:'Cuenca, Ecuador', nationality:'Ecuador', address:'', phone:'', email:'', country:'Ecuador', city:'Cuenca', lat:-2.897, lng:-79.004, is_root:false, cedula:'1700000004', profession:'Agricultor',   notes:'Abuelo paterno', photo_url:null, created_at:'', created_by:null },
  { id:'p5',  family_id:FAM, name:'Lucía',          last:'Ríos Andrade',         gender:'F', born:'1935-06-12', died:'2005-11-22', born_place:'Quito, Ecuador',  died_place:'Quito, Ecuador',  nationality:'Ecuador', address:'', phone:'', email:'', country:'Ecuador', city:'Cuenca', lat:-2.900, lng:-79.006, is_root:false, cedula:'1700000005', profession:'Ama de casa', notes:'Abuela paterna', photo_url:null, created_at:'', created_by:null },
  { id:'p6',  family_id:FAM, name:'Ismael',         last:'Torres Bermeo',        gender:'M', born:'1932-09-10', died:'2010-03-14', born_place:'Guayaquil',       died_place:'Guayaquil',       nationality:'Ecuador', address:'', phone:'', email:'', country:'Ecuador', city:'Guayaquil', lat:2.195, lng:-79.888, is_root:false, cedula:'1700000006', profession:'Marino',   notes:'', photo_url:null, created_at:'', created_by:null },
  { id:'p7',  family_id:FAM, name:'Rosa',           last:'Vega Paredes',         gender:'F', born:'1936-04-25', died:'2018-08-02', born_place:'Quito, Ecuador',  died_place:'Guayaquil',       nationality:'Ecuador', address:'', phone:'', email:'', country:'Ecuador', city:'Guayaquil', lat:2.193, lng:-79.890, is_root:false, cedula:'1700000007', profession:'Modista',  notes:'', photo_url:null, created_at:'', created_by:null },
  { id:'p16', family_id:FAM, name:'Juan Pablo',     last:'Mendoza Torres',       gender:'M', born:'1985-11-10', died:null, born_place:'Quito, Ecuador',     died_place:null, nationality:'Ecuador', address:'Calle Eloy Alfaro', phone:'099 888 0016', email:'juan@example.com',  country:'Ecuador',  city:'Guayaquil', lat:2.19,   lng:-79.88, is_root:false, cedula:'1700000016', profession:'Abogado',          notes:'', photo_url:null, created_at:'', created_by:null },
  { id:'p17', family_id:FAM, name:'Ana Sofía',      last:'Mendoza Torres',       gender:'F', born:'1988-05-30', died:null, born_place:'Quito, Ecuador',     died_place:null, nationality:'Ecuador', address:'Cl 80 # 10-20',    phone:'311 444 5555', email:'ana@example.com',   country:'Colombia', city:'Bogotá',    lat:4.711,  lng:-74.072, is_root:false, cedula:'1700000017', profession:'Médica',           notes:'', photo_url:null, created_at:'', created_by:null },
  { id:'p18', family_id:FAM, name:'Diego Sebastián',last:'Mendoza Torres',       gender:'M', born:'1991-08-14', died:null, born_place:'Quito, Ecuador',     died_place:null, nationality:'Ecuador', address:'Av. 10 de Agosto',  phone:'099 005 0018', email:'diego@example.com', country:'Ecuador',  city:'Quito',     lat:-0.184, lng:-78.472, is_root:false, cedula:'1700000018', profession:'Diseñador',        notes:'', photo_url:null, created_at:'', created_by:null },
  { id:'p19', family_id:FAM, name:'Luis Fernando',  last:'Mendoza Vargas',       gender:'M', born:'2000-08-22', died:null, born_place:'Quito, Ecuador',     died_place:null, nationality:'Ecuador', address:'Av. Amazonas 55',   phone:'', email:'', country:'Ecuador',  city:'Quito',     lat:-0.183, lng:-78.471, is_root:false, cedula:'1700000019', profession:'Estudiante',       notes:'', photo_url:null, created_at:'', created_by:null },
  { id:'p20', family_id:FAM, name:'Camila Alejandra',last:'Mendoza Vargas',      gender:'F', born:'2003-03-11', died:null, born_place:'Quito, Ecuador',     died_place:null, nationality:'Ecuador', address:'Av. Amazonas 55',   phone:'', email:'', country:'Ecuador',  city:'Quito',     lat:-0.184, lng:-78.472, is_root:false, cedula:'1700000020', profession:'Estudiante',       notes:'', photo_url:null, created_at:'', created_by:null },
  { id:'p21', family_id:FAM, name:'Valeria',        last:'Cordero Ponce',        gender:'F', born:'1987-04-02', died:null, born_place:'Guayaquil, Ecuador', died_place:null, nationality:'Ecuador', address:'Av. Las Américas',  phone:'099 006 0021', email:'valeria@example.com',country:'Ecuador',  city:'Guayaquil', lat:2.192,  lng:-79.886, is_root:false, cedula:'1700000021', profession:'Economista',       notes:'Pareja de Juan Pablo', photo_url:null, created_at:'', created_by:null },
  { id:'p22', family_id:FAM, name:'Marco Antonio',  last:'Villacís Rueda',       gender:'M', born:'1986-12-19', died:null, born_place:'Quito, Ecuador',     died_place:null, nationality:'Ecuador', address:'Cl 80 # 10-20',    phone:'311 555 6666', email:'marco@example.com', country:'Colombia', city:'Bogotá',    lat:4.712,  lng:-74.070, is_root:false, cedula:'1700000022', profession:'Cirujano',         notes:'Pareja de Ana Sofía', photo_url:null, created_at:'', created_by:null },
  { id:'p27', family_id:FAM, name:'Mateo',          last:'Mendoza Cordero',      gender:'M', born:'2012-03-20', died:null, born_place:'Guayaquil, Ecuador', died_place:null, nationality:'Ecuador', address:'', phone:'', email:'', country:'Ecuador',  city:'Guayaquil', lat:2.191,  lng:-79.887, is_root:false, cedula:'',          profession:'Estudiante',       notes:'', photo_url:null, created_at:'', created_by:null },
  { id:'p28', family_id:FAM, name:'Valentina',      last:'Mendoza Cordero',      gender:'F', born:'2015-09-08', died:null, born_place:'Guayaquil, Ecuador', died_place:null, nationality:'Ecuador', address:'', phone:'', email:'', country:'Ecuador',  city:'Guayaquil', lat:2.190,  lng:-79.888, is_root:false, cedula:'',          profession:'Estudiante',       notes:'', photo_url:null, created_at:'', created_by:null },
]

export const DEMO_LINKS: Link[] = [
  { id:'l01', family_id:FAM, from_id:'p1',  to_id:'p2',  type:'pareja',  created_at:'' },
  { id:'l02', family_id:FAM, from_id:'p1',  to_id:'p3',  type:'pareja',  created_at:'' },
  { id:'l03', family_id:FAM, from_id:'p4',  to_id:'p5',  type:'pareja',  created_at:'' },
  { id:'l04', family_id:FAM, from_id:'p6',  to_id:'p7',  type:'pareja',  created_at:'' },
  { id:'l05', family_id:FAM, from_id:'p4',  to_id:'p1',  type:'hijo',    created_at:'' },
  { id:'l06', family_id:FAM, from_id:'p5',  to_id:'p1',  type:'hijo',    created_at:'' },
  { id:'l07', family_id:FAM, from_id:'p6',  to_id:'p2',  type:'hija',    created_at:'' },
  { id:'l08', family_id:FAM, from_id:'p7',  to_id:'p2',  type:'hija',    created_at:'' },
  { id:'l09', family_id:FAM, from_id:'p1',  to_id:'p16', type:'hijo',    created_at:'' },
  { id:'l10', family_id:FAM, from_id:'p2',  to_id:'p16', type:'hijo',    created_at:'' },
  { id:'l11', family_id:FAM, from_id:'p1',  to_id:'p17', type:'hija',    created_at:'' },
  { id:'l12', family_id:FAM, from_id:'p2',  to_id:'p17', type:'hija',    created_at:'' },
  { id:'l13', family_id:FAM, from_id:'p1',  to_id:'p18', type:'hijo',    created_at:'' },
  { id:'l14', family_id:FAM, from_id:'p2',  to_id:'p18', type:'hijo',    created_at:'' },
  { id:'l15', family_id:FAM, from_id:'p1',  to_id:'p19', type:'hijo',    created_at:'' },
  { id:'l16', family_id:FAM, from_id:'p3',  to_id:'p19', type:'hijo',    created_at:'' },
  { id:'l17', family_id:FAM, from_id:'p1',  to_id:'p20', type:'hija',    created_at:'' },
  { id:'l18', family_id:FAM, from_id:'p3',  to_id:'p20', type:'hija',    created_at:'' },
  { id:'l19', family_id:FAM, from_id:'p16', to_id:'p21', type:'pareja',  created_at:'' },
  { id:'l20', family_id:FAM, from_id:'p16', to_id:'p27', type:'hijo',    created_at:'' },
  { id:'l21', family_id:FAM, from_id:'p21', to_id:'p27', type:'hijo',    created_at:'' },
  { id:'l22', family_id:FAM, from_id:'p16', to_id:'p28', type:'hija',    created_at:'' },
  { id:'l23', family_id:FAM, from_id:'p21', to_id:'p28', type:'hija',    created_at:'' },
  { id:'l24', family_id:FAM, from_id:'p17', to_id:'p22', type:'pareja',  created_at:'' },
]

export const DEMO_EVENTS: FamilyEvent[] = [
  { id:'e1',  family_id:FAM, person_id:'p1',  type:'nacimiento',  date:'1960-03-15', place:'Quito, Ecuador',  description:'Hospital Eugenio Espejo', lat:null, lng:null, created_at:'' },
  { id:'e2',  family_id:FAM, person_id:'p1',  type:'matrimonio',  date:'1982-06-20', place:'Quito, Ecuador',  description:'Parroquia La Merced',     lat:null, lng:null, created_at:'' },
  { id:'e3',  family_id:FAM, person_id:'p1',  type:'graduación',  date:'1984-07-15', place:'UCE, Quito',      description:'Ingeniería Civil',        lat:null, lng:null, created_at:'' },
  { id:'e4',  family_id:FAM, person_id:'p16', type:'nacimiento',  date:'1985-11-10', place:'Quito, Ecuador',  description:'Clínica Metropolitana',   lat:null, lng:null, created_at:'' },
  { id:'e5',  family_id:FAM, person_id:'p17', type:'nacimiento',  date:'1988-05-30', place:'Quito, Ecuador',  description:'',                        lat:null, lng:null, created_at:'' },
]
