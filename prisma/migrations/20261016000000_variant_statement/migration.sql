-- Las variantes históricas conservan su contenido; vacío usa el enunciado común.
ALTER TABLE "ExerciseVariant" ADD COLUMN "statement" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ExerciseVariant" ADD COLUMN "typeContract" TEXT NOT NULL DEFAULT '';
