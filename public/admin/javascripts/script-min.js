function saveAll(e){var o=$(e).data("projectid"),a=$("#description").val(),s=$("input[name=layout]:checked").val(),n=$(".loading-wrapper"),t=$(".loading-screen"),c={id:o,description:a,layout:s};n.addClass("show"),n.fadeTo(300,1,function(e){$.post("/admin/save_all",c,function(e){console.log("saved successfully"),t.addClass("success").delay(100).queue(function(e){n.fadeTo(1800,0,function(){$(this).removeClass("show")}),$(this).delay(1900).queue(function(e){$(this).removeClass("success"),e()}),e()})})})}$(".project-form form").on("submit",function(e){e.preventDefault();var o=$("#project-name"),a=o.val(),s=o.data("whoid");""!==a&&void 0==s?$.post("/admin/create_project",{name:a},function(e){o.val("")}):""!==a&&void 0!==s&&$.post("/admin/create_sub_project",{name:a,parentId:s},function(e){console.log("success: ",e)})});