function saveAll(e){var a=$(e).data("projectid"),i=$("#project-name-input"),t=i.val(),n=i.data("currentName"),s=$("#description").val(),c=$("input[name=layout]:checked").val(),d=$(".loading-wrapper"),r=$(".loading-screen"),m={id:a,description:s,layout:c};t!=n&&(m.name=t,m.namechanged=!0),d.addClass("show"),d.fadeTo(300,1,function(e){$.post("/admin/save_all",m,function(e){console.log("saved successfully"),"changed"==e&&$(".li-wrapper.active > a > span").text(t),r.addClass("success").delay(100).queue(function(e){d.fadeTo(1800,0,function(){$(this).removeClass("show")}),$(this).delay(1900).queue(function(e){$(this).removeClass("success"),e()}),e()})})})}function reloadAll(){location.reload()}function successAnimation(e){e.addClass("updated").delay(1e3).queue(function(e){$(this).removeClass("updated"),e()})}function updateImage(e,a,i){var t=i.length+1,n=a.substring(t);projectId=$(".current-id").data("id");var s,c=$(e).closest(".img-li");"visibility"==i&&(s=$(e)[0].checked);var d={imgid:n,proid:projectId,vistatus:s};$.post("/admin/update_image/"+i,d,function(e){"success"==e&&("delete"==i?c.hide():successAnimation(c))})}function imageView(e,a){var i=$(e).parent(),t=i.attr("id");if(currentImgId!==t){currentImgId=t;var n="#imgList_"+a,s=$(n),c=i.find(".img-form").first();$currentImageNameInput=c.find(".form-img--name:first");var d=$(".img-li.active"),r=d.find(".img-form").first();$activeNameInput=r.find(".form-img--name:first"),s.addClass("big-view"),$activeNameInput.val($activeNameInput.data("imgname")),d.removeClass("active"),i.addClass("active")}}function saveImgEdit(e,a){var i=$(".img-li.active"),t=i.find(".form-img--name:first"),n=t.val(),s=i.find(".form-img--desc:first"),c=s.val(),d={project_id:e,image_id:a,name:n,desc:c};$.post("/admin/edit_image",d,function(e){"success"==e&&(t.data("imgname",n),s.data("imgdesc",c),successAnimation(i))})}function cancelImgEdit(){var e=$(".img-li.active"),a=e.find(".form-img--name:first"),i=e.find(".form-img--desc:first");a.val(a.data("imgname")),i.val(i.data("imgdesc"))}function closeBigView(e){var a=$(".img-li.active");cancelImgEdit(),a.removeClass("active"),$(e).parent().parent().removeClass("big-view"),currentImgId=""}var projectId,currentImageDesc,$currentImageNameInput,$activeNameInput,currentImgId;$(".project-form form").on("submit",function(e){e.preventDefault();var a=$("#project-name"),i=a.val(),t=a.data("whoid");""!==i&&void 0==t?$.post("/admin/create_project",{name:i},function(e){a.val("")}):""!==i&&void 0!==t&&$.post("/admin/create_sub_project",{name:i,parentId:t},function(e){console.log("success: ",e)})});