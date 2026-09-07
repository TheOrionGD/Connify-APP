-- AlterTable
ALTER TABLE "capsules" ADD COLUMN     "blinded_grid_cell" TEXT;

-- AlterTable
ALTER TABLE "episodes" ADD COLUMN     "bch_syndromes" TEXT,
ADD COLUMN     "grid_cells_json" TEXT,
ADD COLUMN     "helper_string_y" TEXT;
