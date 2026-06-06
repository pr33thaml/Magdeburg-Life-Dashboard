import type { DashboardData } from "@/lib/types";
import type { PopulationExplainerContext } from "@/components/population/PopulationExplainerSheet";

export function buildPopulationContext(
  data: DashboardData["population"],
  year: number
): PopulationExplainerContext {
  const growth = data.growth.find((d) => d.year === year);
  const age = data.averageAge.find((d) => d.year === year);
  const birthsDeaths = data.birthsDeaths.find((d) => d.year === year);
  const migration = data.migration.find((d) => d.year === year);

  return {
    year,
    population: growth?.value,
    averageAge: age?.value,
    births: birthsDeaths?.births,
    deaths: birthsDeaths?.deaths,
    naturalChange: birthsDeaths?.naturalChange,
    migrationIn: migration?.migrationIn,
    migrationOut: migration?.migrationOut,
    netMigration: migration?.netMigration,
  };
}
