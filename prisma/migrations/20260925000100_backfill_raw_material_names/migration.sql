-- Backfill the Raw Material Name master from raw materials that already
-- exist in Item Master, so editing an existing raw material item doesn't
-- suddenly require picking a name from what would otherwise be an empty
-- master (the API now requires RAW_MATERIAL item names to come from it,
-- same as PRODUCT already required for Product Names).
INSERT INTO "RawMaterialName" ("id", "name", "isActive", "createdAt")
SELECT lower(hex(randomblob(16))), "name", 1, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "name" FROM "Item" WHERE "type" = 'RAW_MATERIAL')
WHERE "name" NOT IN (SELECT "name" FROM "RawMaterialName");
