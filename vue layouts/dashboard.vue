<!-- Navigation -->
<nav class="flex-1 overflow-y-auto py-4">
    <TooltipProvider :delay-duration="100">
      <ul class="space-y-1 px-2">
        {/* Move v-for to li */}
        <li v-for="item in navItems" :key="item.path">
          {/* Tooltip now inside li */}
          <Tooltip>
            <TooltipTrigger as-child>
              <NuxtLink
                :to="item.path"
                class="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                :class="[
                  isSidebarCollapsed ? 'justify-center' : 'gap-3',
                  isActiveRoute(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted text-muted-foreground',
                ]"
                @click="isMobile && toggleSidebar()"
              >
                <component
                  :is="item.icon"
                  class="h-5 w-5"
                  :class="{ 'text-primary': isActiveRoute(item.path) }"
                />
                <span :class="isSidebarCollapsed ? 'sr-only' : ''">
                  {{ item.name }}
                </span>
                <div
                  v-if="isActiveRoute(item.path) && !isSidebarCollapsed"
                  class="ml-auto w-1.5 h-5 bg-primary rounded-full"
                ></div>
              </NuxtLink>
            </TooltipTrigger>
            <TooltipContent v-if="isSidebarCollapsed" side="right">
              <p class="text-white">
                {{ item.name }}
              </p>
            </TooltipContent>
          </Tooltip>
        </li>
      </ul>
    </TooltipProvider>
  </nav>
