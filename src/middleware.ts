import { updateSession } from '@/lib/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */

    /*
    Regex Structure Breakdown
    1. / ... / 
      - Represents the complete regex pattern (Next.js uses this to filter paths)

    2. ((?! ... ).*) 
      - ?! ... is a Negative Lookahead → meaning "must not match the content within the parentheses"
      - .* matches all characters that follow after verifying it doesn't match the pattern in ?!
      - Therefore, it means "match any path except those specified in the parentheses"

    3. Excluded items (not captured by middleware)
      - _next/static → Next.js static files
      - _next/image → Next.js image optimization files
      - favicon.ico → Favicon file
      - .*\.(?:svg|png|jpg|jpeg|gif|webp)$ → Various image files (svg, png, jpg, jpeg, gif, webp)

    Summary of meaning
    This middleware will process every request path
    Except:
      - Static files within _next/static
      - Image optimization via _next/image
      - The favicon.ico file
      - Image files with extensions .svg, .png, .jpg, .jpeg, .gif, .webp
    */

    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
