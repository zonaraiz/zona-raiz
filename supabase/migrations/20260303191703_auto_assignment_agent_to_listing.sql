create or replace function public.set_listing_agent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_agent_id uuid;
  v_agent_re_id uuid;
  v_prop_re_id uuid;
begin
  -- 1. Buscar Agente
  select id, real_estate_id into v_agent_id, v_agent_re_id
  from public.real_estate_agents
  where profile_id = auth.uid();

  if v_agent_id is null then
    raise exception 'Acceso denegado: El perfil % no es un agente registrado.', auth.uid();
  end if;

  -- 2. Buscar Inmobiliaria de la Propiedad
  select real_estate_id into v_prop_re_id
  from public.properties
  where id = new.property_id;

  if v_prop_re_id is null then
    raise exception 'Error: La propiedad % no existe.', new.property_id;
  end if;

  -- 3. Validar pertenencia
  if v_agent_re_id <> v_prop_re_id then
    raise exception 'Conflicto: El agente (Inmo: %) no pertenece a la Inmobiliaria de la propiedad (Inmo: %).',
      v_agent_re_id, v_prop_re_id;
  end if;

  new.agent_id := v_agent_id;
  return new;
end;
$$;

create trigger on_listing_created
  before insert on public.listings
  for each row
  execute function public.set_listing_agent();
