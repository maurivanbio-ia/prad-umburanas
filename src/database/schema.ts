import { pgTable, text, timestamp, integer, doublePrecision, boolean, uuid } from 'drizzle-orm/pg-core';

export const projectSettings = pgTable('project_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  label: text('label'),
  group: text('group'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const windComplexes = pgTable('wind_complexes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  description: text('description'),
});

export const pradAreas = pgTable('prad_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  number: integer('number').notNull(),
  windComplex: text('wind_complex'),
  name: text('name').notNull(),
  areaHa: doublePrecision('area_ha').notNull(),
  actionType: text('action_type'),
  soilCollectionStatus: text('soil_collection_status').default('Não iniciado'),
  soilCollectionDate: timestamp('soil_collection_date'),
  maintenanceStatus: text('maintenance_status').default('Não iniciado'),
  maintenanceDate: timestamp('maintenance_date'),
  irrigationStatus: text('irrigation_status').default('Não iniciado'),
  irrigationDate: timestamp('irrigation_date'),
  operationalMonitoring: text('operational_monitoring').default('Não iniciado'),
  ecologicalMonitoring: text('ecological_monitoring').default('Não iniciado'),
  responsible: text('responsible').default('Equipe de Campo'),
  status: text('status').default('Em andamento'),
  completionPct: doublePrecision('completion_pct').default(0),
  startDate: timestamp('start_date'),
  plannedEndDate: timestamp('planned_end_date'),
  realEndDate: timestamp('real_end_date'),
  newDate: timestamp('new_date'),
  remainingDays: integer('remaining_days'),
  notes: text('notes'),
  fortnight: text('fortnight'),
  resultProtocol: text('result_protocol'),
  pendingIssue: text('pending_issue'),
  extensionDate: timestamp('extension_date'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: text('category'),
  description: text('description'),
});

export const activityStatuses = pgTable('activity_statuses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').notNull(),
  orderIndex: integer('order_index').default(0),
  isActive: boolean('is_active').default(true),
});

export const planningItems = pgTable('planning_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: integer('code'),
  activity: text('activity').notNull(),
  unit: text('unit').notNull(),
  targetMetric: doublePrecision('target_metric').notNull(),
  startDate: timestamp('start_date'),
  plannedEndDate: timestamp('planned_end_date'),
  realEndDate: timestamp('real_end_date'),
  newDate: timestamp('new_date'),
  responsible: text('responsible'),
  status: text('status').default('Em andamento'),
  completionPct: doublePrecision('completion_pct').default(0),
  executed: doublePrecision('executed').default(0),
  remaining: doublePrecision('remaining').default(0),
  notes: text('notes'),
});

export const scheduleItems = pgTable('schedule_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: integer('code'),
  activity: text('activity').notNull(),
  plannedStart: timestamp('planned_start'),
  plannedEnd: timestamp('planned_end'),
  realEnd: timestamp('real_end'),
  newDate: timestamp('new_date'),
  status: text('status').default('Não iniciado'),
  weight: integer('weight').default(1),
  dependencies: text('dependencies'),
  notes: text('notes'),
});

export const photos = pgTable('photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileName: text('file_name').notNull(),
  storagePath: text('storage_path').notNull(),
  mimeType: text('mime_type').default('image/jpeg'),
  fileSize: integer('file_size'),
  capturedAt: timestamp('captured_at'),
  hora: text('hora'),
  utmZone: text('utm_zone'),
  easting: doublePrecision('easting'),
  northing: doublePrecision('northing'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  code: text('code'),
  local: text('local'),
  activity: text('activity'),
  notes: text('notes'),
  confidence: text('confidence').default('Alta'),
  areaId: uuid('area_id'),
  responsible: text('responsible').default('Equipe de Campo'),
  isGeoreferenced: boolean('is_georeferenced').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const photoAreaLinks = pgTable('photo_area_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  photoId: uuid('photo_id').notNull(),
  areaId: uuid('area_id').notNull(),
  confirmedBy: text('confirmed_by'),
  confirmedAt: timestamp('confirmed_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('Consulta'), // Administrador, Gestor, Equipe de Campo, Consulta
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  userName: text('user_name').default('Sistema'),
  action: text('action').notNull(), // CREATE, UPDATE, DELETE, IMPORT
  entity: text('entity').notNull(),
  entityId: text('entity_id'),
  fieldName: text('field_name'),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: text('category').default('Geral'),
  fileSize: integer('file_size'),
  storagePath: text('storage_path').notNull(),
  areaId: uuid('area_id'),
  uploadedBy: text('uploaded_by').default('Equipe de Campo'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});
