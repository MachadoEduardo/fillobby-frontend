import { Gamepad2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeactivateGameDialog } from "@/features/games/components/deactivate-game-dialog";
import { EditGameDialog } from "@/features/games/components/edit-game-dialog";
import { useAuth } from "@/lib/auth";
import { resolveApiAssetUrl } from "@/lib/api";
import type { Game } from "@/lib/api-types";

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  const { user } = useAuth();
  const [coverFailed, setCoverFailed] = useState(false);
  const coverUrl = resolveApiAssetUrl(game.coverUrl);
  const canManage = user?.id === game.createdById;

  useEffect(() => setCoverFailed(false), [coverUrl]);

  return (
    <Card className="group flex h-full flex-col overflow-hidden bg-card/70 shadow-none transition-colors hover:border-input hover:bg-card">
      <div className="overflow-hidden border-b bg-muted">
        {coverUrl && !coverFailed ? (
          <img
            src={coverUrl}
            alt={`Capa de ${game.title}`}
            loading="lazy"
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <div className="flex aspect-video items-center justify-center text-muted-foreground">
            <Gamepad2 className="h-8 w-8" aria-hidden />
            <span className="sr-only">Jogo sem imagem de capa</span>
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug">
          {game.title}
        </h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {game.platforms.map((platform) => (
            <Badge key={platform} variant="secondary">
              {platform}
            </Badge>
          ))}
          {game.maxPlayers && (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" aria-hidden />
              Até {game.maxPlayers}
            </Badge>
          )}
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {game.description ||
            "Sem descrição. Consulte as plataformas disponíveis antes de adicionar este jogo à fila."}
        </p>

        {canManage && (
          <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
            <EditGameDialog game={game} />
            <DeactivateGameDialog game={game} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
