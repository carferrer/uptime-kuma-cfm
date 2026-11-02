// Runtime prefix supplied by our Supervisor-only proxy, never by query parameters.
export function ingressPrefix() {
    const value = document.querySelector('meta[name="kuma-ingress-path"]')?.content;
    if (!value) {
        return "";
    }
    if (!/^\/api\/hassio_ingress\/[A-Za-z0-9_-]+$/.test(value)) {
        throw new Error("Invalid Ingress base path");
    }
    return value;
}

export function ingressBase() {
    return ingressPrefix() + "/";
}

export function ingressURL(path) {
    if (!path.startsWith("/") || path.startsWith("//")) {
        throw new Error("Expected an application-relative path");
    }
    return ingressPrefix() + path;
}

export function appPathname() {
    const prefix = ingressPrefix();
    const path = location.pathname;
    if (!prefix) {
        return path;
    }
    if (path !== prefix && !path.startsWith(prefix + "/")) {
        throw new Error("Page is outside its Ingress path");
    }
    return path.slice(prefix.length) || "/";
}
